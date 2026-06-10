package tn.pfe.arabicquality.requests.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.pfe.arabicquality.audit.Audit;
import tn.pfe.arabicquality.catalog.domain.EvaluationValue;
import tn.pfe.arabicquality.catalog.repository.EvaluationValueRepository;
import tn.pfe.arabicquality.notifications.EmailService;
import tn.pfe.arabicquality.notifications.Notification;
import tn.pfe.arabicquality.notifications.NotificationRepository;
import tn.pfe.arabicquality.requests.domain.*;
import tn.pfe.arabicquality.requests.dto.RequestDtos;
import tn.pfe.arabicquality.requests.repository.EvaluationAnswerRepository;
import tn.pfe.arabicquality.requests.repository.EvaluationRequestRepository;
import tn.pfe.arabicquality.requests.repository.RequestAssignmentRepository;
import tn.pfe.arabicquality.requests.repository.WorkflowDecisionRepository;
import tn.pfe.arabicquality.scoring.ScoringService;
import tn.pfe.arabicquality.users.domain.Role;
import tn.pfe.arabicquality.users.domain.User;
import tn.pfe.arabicquality.users.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EvaluationWorkflowService {

    private final EvaluationRequestRepository requestRepository;
    private final EvaluationAnswerRepository answerRepository;
    private final EvaluationValueRepository valueRepository;
    private final RequestAssignmentRepository assignmentRepository;
    private final WorkflowDecisionRepository decisionRepository;
    private final UserRepository userRepository;
    private final EvaluationRequestService requestService;
    private final ScoringService scoringService;
    private final EmailService emailService;
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<RequestDtos.SummaryDto> inbox(String kcId, String status) {
        User user = currentUser(kcId);
        Set<Long> assignedIds = new HashSet<>();
        assignmentRepository.findByAssignedUserIdAndCompletedAtIsNullOrderByAssignedAtDesc(user.getId())
                .forEach(assignment -> assignedIds.add(assignment.getRequest().getId()));
        String role = user.getRole().getCode();
        return requestRepository.findAllByOrderByUpdatedAtDesc().stream()
                .filter(request -> status == null || status.isBlank() || request.getStatus().name().equals(status))
                .filter(request -> assignedIds.contains(request.getId()) || visibleForRole(role, request.getStatus()))
                .map(this::summary)
                .toList();
    }

    @Transactional(readOnly = true)
    public RequestDtos.WorkflowDetailDto workflowDetail(Long requestId) {
        EvaluationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new NoSuchElementException("Request not found: " + requestId));
        return new RequestDtos.WorkflowDetailDto(
                requestService.toWorkflowDetail(request),
                valueRepository.findAllByOrderByDisplayOrderAscCodeAsc().stream()
                        .filter(EvaluationValue::isActive)
                        .map(v -> new RequestDtos.ValueDto(v.getId(), v.getCode(), v.getLabelAr(), v.getLabelEn(), v.getDisplayOrder()))
                        .toList(),
                assignmentRepository.findByRequestIdOrderByAssignedAtDesc(requestId).stream()
                        .map(this::assignmentDto)
                        .toList(),
                decisionRepository.findByRequestIdOrderByDecidedAtDesc(requestId).stream()
                        .map(this::decisionDto)
                        .toList());
    }

    @Transactional
    @Audit(action = "UPDATE_FINAL_ANSWER", entity = "evaluation_answer", description = "Evaluator adjusted final answer")
    public RequestDtos.AnswerDto reviewAnswer(String kcId, Long answerId, RequestDtos.AnswerReviewDto dto) {
        User user = currentUser(kcId);
        EvaluationAnswer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new NoSuchElementException("Answer not found: " + answerId));
        ensureCanReview(user, answer.getRequest());
        EvaluationValue value = valueRepository.findById(dto.getFinalValueId())
                .filter(EvaluationValue::isActive)
                .orElseThrow(() -> new NoSuchElementException("Evaluation value not found: " + dto.getFinalValueId()));
        answer.setFinalValue(value);
        answer.setEvaluatorNote(dto.getEvaluatorNote());
        answer.setEditedByEvaluator(user);
        answer.setEditedAt(LocalDateTime.now());
        return answerDto(answerRepository.save(answer));
    }

    @Transactional
    @Audit(action = "WORKFLOW_DECISION", entity = "evaluation_request", description = "Workflow decision recorded")
    public RequestDtos.WorkflowDetailDto decide(String kcId, Long requestId, RequestDtos.DecisionSaveDto dto) {
        User user = currentUser(kcId);
        EvaluationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new NoSuchElementException("Request not found: " + requestId));
        RequestAssignment.Stage stage = stageFor(user, request.getStatus());
        WorkflowDecision.Decision decision = WorkflowDecision.Decision.valueOf(dto.getDecision());
        RequestStatus next = nextStatus(stage, decision);

        WorkflowDecision record = decisionRepository.findByRequestIdAndStage(requestId, stage)
                .orElseGet(() -> WorkflowDecision.builder().request(request).stage(stage).build());
        record.setDecision(decision);
        record.setNotes(dto.getNotes());
        record.setDecidedBy(user);
        record.setDecidedAt(LocalDateTime.now());
        decisionRepository.save(record);

        assignmentRepository.findByRequestIdAndStage(requestId, stage).ifPresent(assignment -> {
            assignment.setCompletedAt(LocalDateTime.now());
            assignmentRepository.save(assignment);
        });

        request.setStatus(next);
        if (next == RequestStatus.REJECTED_INITIAL || next == RequestStatus.REJECTED_ADMIN || next == RequestStatus.REJECTED_FINAL) {
            request.setLocked(true);
        }
        if (next == RequestStatus.PENDING_ADMIN) {
            request.setLocked(true);
            autoAssign(request, RequestAssignment.Stage.ADMIN_REVIEW, Role.ADMIN_REVIEWER, user);
        }
        if (next == RequestStatus.PENDING_FIELD) {
            autoAssign(request, RequestAssignment.Stage.FIELD_REVIEW, Role.FIELD_REVIEWER, user);
        }
        if (next == RequestStatus.COMPLETED) {
            request.setLocked(true);
            requestRepository.save(request);
            ScoringService.ScoreResult score = scoringService.calculate(request.getId());
            notifyOwner(request,
                    "REPORT_READY",
                    "التقرير النهائي جاهز",
                    "Final report is ready",
                    "تم إصدار التقرير النهائي ويمكنك تحميله من صفحة الطلب.",
                    "The final report has been issued and is ready to download.",
                    true);
            try {
                emailService.sendEvaluationCompleted(
                        request.getSubmittedBy().getEmail(),
                        request.getSubmittedBy().getFullName(),
                        request.getRequestNumber(),
                        score.gradeId() == null ? "-" : String.valueOf(score.gradeId()),
                        score.percentage().toPlainString(),
                        "/my-requests/" + request.getId());
            } catch (Exception ignored) {
                // Email is non-blocking; the completed workflow must remain committed.
            }
            return workflowDetail(requestId);
        }
        if (next == RequestStatus.INFO_REQUESTED) {
            notifyOwner(request,
                    "INFO_REQUESTED",
                    "مطلوب معلومات إضافية",
                    "Additional information requested",
                    "يرجى مراجعة الطلب وإضافة المعلومات المطلوبة.",
                    "Please review the request and add the requested information.",
                    true);
        } else if (next.name().startsWith("REJECTED")) {
            notifyOwner(request,
                    "REQUEST_REJECTED",
                    "تم رفض الطلب",
                    "Request rejected",
                    "تم رفض طلب التقييم. راجع ملاحظات القرار.",
                    "The evaluation request was rejected. Review the decision notes.",
                    false);
        } else if (next.name().startsWith("PENDING") || next.name().startsWith("APPROVED")) {
            notifyOwner(request,
                    "REQUEST_STATUS_CHANGED",
                    "تم تحديث حالة الطلب",
                    "Request status updated",
                    "تم تحديث حالة طلب التقييم الخاص بك.",
                    "Your evaluation request status has been updated.",
                    false);
        }
        requestRepository.save(request);
        return workflowDetail(requestId);
    }

    @Transactional
    @Audit(action = "ASSIGN_REQUEST", entity = "request_assignment", description = "Evaluation request assigned")
    public RequestDtos.AssignmentDto assign(String kcId, RequestDtos.AssignDto dto) {
        User assigner = currentUser(kcId);
        EvaluationRequest request = requestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new NoSuchElementException("Request not found: " + dto.getRequestId()));
        User assigned = userRepository.findById(dto.getAssignedUserId())
                .orElseThrow(() -> new NoSuchElementException("Assigned user not found: " + dto.getAssignedUserId()));
        RequestAssignment.Stage stage = RequestAssignment.Stage.valueOf(dto.getStage());
        validateRoleForStage(assigned, stage);

        RequestAssignment assignment = assignmentRepository.findByRequestIdAndStage(request.getId(), stage)
                .orElseGet(() -> RequestAssignment.builder().request(request).stage(stage).build());
        assignment.setAssignedUser(assigned);
        assignment.setAssignedBy(assigner);
        assignment.setAuto(false);
        assignment.setAssignedAt(LocalDateTime.now());
        assignment.setCompletedAt(null);
        if (stage == RequestAssignment.Stage.INITIAL_EVALUATION && request.getStatus() == RequestStatus.PENDING_REVIEW) {
            request.setStatus(RequestStatus.UNDER_EVALUATION);
            requestRepository.save(request);
        }
        return assignmentDto(assignmentRepository.save(assignment));
    }

    @Transactional(readOnly = true)
    public List<RequestDtos.AssignmentDto> assignments() {
        return assignmentRepository.findAll().stream()
                .sorted(Comparator.comparing(RequestAssignment::getAssignedAt).reversed())
                .map(this::assignmentDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RequestDtos.SummaryDto> assignableRequests() {
        return requestRepository.findAllByOrderByUpdatedAtDesc().stream()
                .filter(request -> request.getStatus() != RequestStatus.DRAFT && request.getStatus() != RequestStatus.COMPLETED)
                .map(this::summary)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RequestDtos.ReviewerDto> reviewers(String roleCode) {
        return userRepository.findActiveByRoleCode(roleCode).stream()
                .map(user -> new RequestDtos.ReviewerDto(user.getId(), user.getFullName(), user.getEmail(), user.getRole().getCode()))
                .toList();
    }

    private void autoAssign(EvaluationRequest request, RequestAssignment.Stage stage, String roleCode, User assigner) {
        userRepository.findActiveByRoleCode(roleCode).stream().findFirst()
                .ifPresent(user -> {
                    RequestAssignment assignment = assignmentRepository.findByRequestIdAndStage(request.getId(), stage)
                            .orElseGet(() -> RequestAssignment.builder().request(request).stage(stage).build());
                    assignment.setAssignedUser(user);
                    assignment.setAssignedBy(assigner);
                    assignment.setAuto(true);
                    assignment.setAssignedAt(LocalDateTime.now());
                    assignment.setCompletedAt(null);
                    assignmentRepository.save(assignment);
                });
    }

    private boolean visibleForRole(String role, RequestStatus status) {
        if (Role.EVALUATOR.equals(role)) {
            return status == RequestStatus.PENDING_REVIEW || status == RequestStatus.UNDER_EVALUATION || status == RequestStatus.INFO_REQUESTED;
        }
        if (Role.ADMIN_REVIEWER.equals(role)) {
            return status == RequestStatus.PENDING_ADMIN || status == RequestStatus.APPROVED_INITIAL;
        }
        if (Role.FIELD_REVIEWER.equals(role)) {
            return status == RequestStatus.PENDING_FIELD || status == RequestStatus.APPROVED_ADMIN;
        }
        return false;
    }

    private void ensureCanReview(User user, EvaluationRequest request) {
        if (!visibleForRole(user.getRole().getCode(), request.getStatus())) {
            throw new IllegalStateException("You cannot review this request at its current stage");
        }
    }

    private RequestAssignment.Stage stageFor(User user, RequestStatus status) {
        String role = user.getRole().getCode();
        if (Role.EVALUATOR.equals(role) && visibleForRole(role, status)) return RequestAssignment.Stage.INITIAL_EVALUATION;
        if (Role.ADMIN_REVIEWER.equals(role) && visibleForRole(role, status)) return RequestAssignment.Stage.ADMIN_REVIEW;
        if (Role.FIELD_REVIEWER.equals(role) && visibleForRole(role, status)) return RequestAssignment.Stage.FIELD_REVIEW;
        throw new IllegalStateException("No workflow decision is available for this role and status");
    }

    private RequestStatus nextStatus(RequestAssignment.Stage stage, WorkflowDecision.Decision decision) {
        if (decision == WorkflowDecision.Decision.REQUEST_INFO) return RequestStatus.INFO_REQUESTED;
        return switch (stage) {
            case INITIAL_EVALUATION -> decision == WorkflowDecision.Decision.APPROVED ? RequestStatus.PENDING_ADMIN : RequestStatus.REJECTED_INITIAL;
            case ADMIN_REVIEW -> decision == WorkflowDecision.Decision.APPROVED ? RequestStatus.PENDING_FIELD : RequestStatus.REJECTED_ADMIN;
            case FIELD_REVIEW -> decision == WorkflowDecision.Decision.APPROVED ? RequestStatus.COMPLETED : RequestStatus.REJECTED_FINAL;
        };
    }

    private void validateRoleForStage(User user, RequestAssignment.Stage stage) {
        String role = user.getRole().getCode();
        boolean valid = switch (stage) {
            case INITIAL_EVALUATION -> Role.EVALUATOR.equals(role);
            case ADMIN_REVIEW -> Role.ADMIN_REVIEWER.equals(role);
            case FIELD_REVIEW -> Role.FIELD_REVIEWER.equals(role);
        };
        if (!valid) {
            throw new IllegalArgumentException("Selected user role does not match assignment stage");
        }
    }

    private void notifyOwner(EvaluationRequest request, String eventType, String titleAr, String titleEn,
                             String messageAr, String messageEn, boolean sentViaEmail) {
        Notification notification = notificationRepository.save(Notification.builder()
                .user(request.getSubmittedBy())
                .eventType(eventType)
                .titleAr(titleAr)
                .titleEn(titleEn)
                .messageAr(messageAr)
                .messageEn(messageEn)
                .relatedEntity("evaluation_request")
                .relatedId(request.getId())
                .linkUrl("/my-requests/" + request.getId())
                .read(false)
                .sentViaEmail(sentViaEmail)
                .build());
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + request.getSubmittedBy().getId(),
                Map.of("id", notification.getId(), "eventType", eventType, "titleEn", titleEn, "titleAr", titleAr));
    }

    private User currentUser(String kcId) {
        return userRepository.findByKcId(kcId)
                .orElseThrow(() -> new NoSuchElementException("Current user profile not found"));
    }

    private RequestDtos.SummaryDto summary(EvaluationRequest request) {
        return new RequestDtos.SummaryDto(
                request.getId(),
                request.getRequestNumber(),
                request.getStatus().name(),
                request.getEntity().getName(),
                request.getCategories().size(),
                answerRepository.findByRequestIdOrderByQuestionDisplayOrderAscIdAsc(request.getId()).size(),
                0,
                request.getSubmittedAt(),
                request.getCreatedAt());
    }

    private RequestDtos.AnswerDto answerDto(EvaluationAnswer answer) {
        EvaluationValue initial = answer.getInitialValue();
        EvaluationValue finalValue = answer.getFinalValue();
        return new RequestDtos.AnswerDto(
                answer.getId(),
                answer.getQuestion().getId(),
                answer.getQuestion().getTextAr(),
                answer.getQuestion().getTextEn(),
                initial == null ? null : initial.getId(),
                initial == null ? null : initial.getCode(),
                answer.getAnswerText(),
                finalValue == null ? null : finalValue.getId(),
                finalValue == null ? null : finalValue.getCode(),
                answer.getEvaluatorNote());
    }

    private RequestDtos.AssignmentDto assignmentDto(RequestAssignment assignment) {
        EvaluationRequest request = assignment.getRequest();
        User assigned = assignment.getAssignedUser();
        return new RequestDtos.AssignmentDto(
                assignment.getId(),
                request.getId(),
                request.getRequestNumber(),
                request.getEntity().getName(),
                request.getStatus().name(),
                assignment.getStage().name(),
                assigned.getId(),
                assigned.getFullName(),
                assigned.getEmail(),
                assignment.isAuto(),
                assignment.getAssignedAt(),
                assignment.getCompletedAt());
    }

    private RequestDtos.DecisionDto decisionDto(WorkflowDecision decision) {
        return new RequestDtos.DecisionDto(
                decision.getId(),
                decision.getStage().name(),
                decision.getDecision().name(),
                decision.getNotes(),
                decision.getDecidedBy().getFullName(),
                decision.getDecidedAt());
    }
}
