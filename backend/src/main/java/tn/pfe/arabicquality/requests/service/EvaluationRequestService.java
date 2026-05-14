package tn.pfe.arabicquality.requests.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import tn.pfe.arabicquality.audit.Audit;
import tn.pfe.arabicquality.catalog.domain.EvaluationCategory;
import tn.pfe.arabicquality.catalog.domain.EvaluationValue;
import tn.pfe.arabicquality.catalog.domain.Question;
import tn.pfe.arabicquality.catalog.domain.RequiredDocument;
import tn.pfe.arabicquality.catalog.repository.EvaluationCategoryRepository;
import tn.pfe.arabicquality.catalog.repository.EvaluationValueRepository;
import tn.pfe.arabicquality.catalog.repository.QuestionRepository;
import tn.pfe.arabicquality.catalog.repository.RequiredDocumentRepository;
import tn.pfe.arabicquality.entities.domain.EducationalEntity;
import tn.pfe.arabicquality.entities.repository.EducationalEntityRepository;
import tn.pfe.arabicquality.requests.domain.EvaluationAnswer;
import tn.pfe.arabicquality.requests.domain.EvaluationAttachment;
import tn.pfe.arabicquality.requests.domain.EvaluationRequest;
import tn.pfe.arabicquality.requests.domain.RequestAssignment;
import tn.pfe.arabicquality.requests.domain.RequestStatus;
import tn.pfe.arabicquality.requests.dto.RequestDtos;
import tn.pfe.arabicquality.requests.repository.EvaluationAnswerRepository;
import tn.pfe.arabicquality.requests.repository.EvaluationAttachmentRepository;
import tn.pfe.arabicquality.requests.repository.EvaluationRequestRepository;
import tn.pfe.arabicquality.requests.repository.RequestAssignmentRepository;
import tn.pfe.arabicquality.users.domain.Role;
import tn.pfe.arabicquality.users.domain.User;
import tn.pfe.arabicquality.users.repository.UserRepository;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvaluationRequestService {

    private final EvaluationRequestRepository requestRepository;
    private final EvaluationAnswerRepository answerRepository;
    private final EvaluationAttachmentRepository attachmentRepository;
    private final RequestAssignmentRepository assignmentRepository;
    private final EvaluationCategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;
    private final EvaluationValueRepository valueRepository;
    private final RequiredDocumentRepository requiredDocumentRepository;
    private final EducationalEntityRepository entityRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public RequestDtos.CatalogDto catalog() {
        List<RequestDtos.CategoryDto> categories = categoryRepository.findAllByOrderByDisplayOrderAscNameEnAsc().stream()
                .filter(EvaluationCategory::isActive)
                .map(category -> new RequestDtos.CategoryDto(
                        category.getId(),
                        category.getCode(),
                        category.getNameAr(),
                        category.getNameEn(),
                        questionRepository.findByCategoryIdOrderByDisplayOrderAscIdAsc(category.getId()).stream()
                                .filter(Question::isActive)
                                .map(q -> new RequestDtos.QuestionDto(q.getId(), q.getTextAr(), q.getTextEn(), q.isRequiresAttachment(), q.getDisplayOrder()))
                                .toList(),
                        requiredDocumentRepository.findByCategoryIdOrderByDisplayOrderAscIdAsc(category.getId()).stream()
                                .map(doc -> new RequestDtos.RequiredDocumentDto(doc.getId(), doc.getLabelAr(), doc.getLabelEn(), doc.isMandatory(), doc.getDisplayOrder()))
                                .toList()))
                .toList();
        List<RequestDtos.ValueDto> values = valueRepository.findAllByOrderByDisplayOrderAscCodeAsc().stream()
                .filter(EvaluationValue::isActive)
                .map(v -> new RequestDtos.ValueDto(v.getId(), v.getCode(), v.getLabelAr(), v.getLabelEn(), v.getDisplayOrder()))
                .toList();
        return new RequestDtos.CatalogDto(categories, values);
    }

    @Transactional(readOnly = true)
    public List<RequestDtos.SummaryDto> mine(String kcId) {
        User user = currentUser(kcId);
        return requestRepository.findBySubmittedByIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public RequestDtos.DetailDto detail(String kcId, Long id) {
        User user = currentUser(kcId);
        EvaluationRequest request = requestRepository.findByIdAndSubmittedById(id, user.getId())
                .orElseThrow(() -> new NoSuchElementException("Request not found: " + id));
        return toDetail(request);
    }

    @Transactional
    @Audit(action = "CREATE", entity = "evaluation_request", description = "Evaluation request saved")
    public RequestDtos.DetailDto create(String kcId, RequestDtos.SaveRequestDto dto) {
        User user = currentUser(kcId);
        EducationalEntity entity = managerEntity(user);

        EvaluationRequest request = EvaluationRequest.builder()
                .requestNumber(nextRequestNumber())
                .entity(entity)
                .submittedBy(user)
                .status(RequestStatus.DRAFT)
                .locked(false)
                .build();
        applyRequestPayload(request, dto);
        request = requestRepository.save(request);
        saveAnswers(request, dto);
        if (dto.isSubmit()) {
            validateReadyToSubmit(request);
            request.setStatus(RequestStatus.PENDING_REVIEW);
            request.setSubmittedAt(LocalDateTime.now());
            request = requestRepository.save(request);
            autoAssignInitial(request, user);
        }
        return toDetail(request);
    }

    @Transactional
    @Audit(action = "UPDATE", entity = "evaluation_request", description = "Evaluation request updated")
    public RequestDtos.DetailDto updateDraft(String kcId, Long id, RequestDtos.SaveRequestDto dto) {
        User user = currentUser(kcId);
        EvaluationRequest request = requestRepository.findByIdAndSubmittedById(id, user.getId())
                .orElseThrow(() -> new NoSuchElementException("Request not found: " + id));
        ensureDraft(request);
        applyRequestPayload(request, dto);
        request = requestRepository.save(request);
        answerRepository.deleteByRequestId(request.getId());
        saveAnswers(request, dto);
        if (dto.isSubmit()) {
            validateReadyToSubmit(request);
            request.setStatus(RequestStatus.PENDING_REVIEW);
            request.setSubmittedAt(LocalDateTime.now());
            request = requestRepository.save(request);
            autoAssignInitial(request, user);
        }
        return toDetail(request);
    }

    @Transactional
    @Audit(action = "SUBMIT", entity = "evaluation_request", description = "Evaluation request submitted")
    public RequestDtos.DetailDto submit(String kcId, Long id) {
        User user = currentUser(kcId);
        EvaluationRequest request = requestRepository.findByIdAndSubmittedById(id, user.getId())
                .orElseThrow(() -> new NoSuchElementException("Request not found: " + id));
        ensureDraft(request);
        validateReadyToSubmit(request);
        request.setStatus(RequestStatus.PENDING_REVIEW);
        request.setSubmittedAt(LocalDateTime.now());
        request = requestRepository.save(request);
        autoAssignInitial(request, user);
        return toDetail(request);
    }

    @Transactional
    @Audit(action = "UPLOAD", entity = "evaluation_attachment", description = "Evaluation request attachment uploaded")
    public RequestDtos.AttachmentDto upload(String kcId, Long requestId, Long requiredDocumentId, MultipartFile file) throws IOException {
        User user = currentUser(kcId);
        EvaluationRequest request = requestRepository.findByIdAndSubmittedById(requestId, user.getId())
                .orElseThrow(() -> new NoSuchElementException("Request not found: " + requestId));
        ensureDraft(request);
        RequiredDocument requiredDocument = requiredDocumentRepository.findById(requiredDocumentId)
                .orElseThrow(() -> new NoSuchElementException("Required document not found: " + requiredDocumentId));
        boolean belongsToRequest = request.getCategories().stream()
                .anyMatch(category -> category.getId().equals(requiredDocument.getCategory().getId()));
        if (!belongsToRequest) {
            throw new IllegalArgumentException("Required document does not belong to this request categories");
        }
        FileStorageService.StoredFile stored = fileStorageService.store(file);
        EvaluationAttachment attachment = EvaluationAttachment.builder()
                .request(request)
                .category(requiredDocument.getCategory())
                .requiredDocument(requiredDocument)
                .fileUuid(stored.uuid())
                .originalName(file.getOriginalFilename() == null ? stored.uuid() : file.getOriginalFilename())
                .mimeType(stored.mimeType())
                .sizeBytes(file.getSize())
                .storagePath(stored.storagePath())
                .sha256(stored.sha256())
                .uploadedBy(user)
                .build();
        return toAttachmentDto(attachmentRepository.save(attachment));
    }

    private void applyRequestPayload(EvaluationRequest request, RequestDtos.SaveRequestDto dto) {
        Set<Long> ids = new HashSet<>(dto.getCategoryIds());
        List<EvaluationCategory> categories = categoryRepository.findAllById(ids);
        if (categories.size() != ids.size()) {
            throw new NoSuchElementException("One or more categories were not found");
        }
        categories.forEach(category -> {
            if (!category.isActive()) throw new IllegalArgumentException("Inactive category selected: " + category.getCode());
        });
        request.getCategories().clear();
        request.getCategories().addAll(categories);
    }

    private void saveAnswers(EvaluationRequest request, RequestDtos.SaveRequestDto dto) {
        Set<Long> categoryIds = request.getCategories().stream().map(EvaluationCategory::getId).collect(Collectors.toSet());
        Map<Long, Question> questions = questionRepository.findAllById(dto.getAnswers().stream().map(RequestDtos.AnswerSaveDto::getQuestionId).toList())
                .stream().collect(Collectors.toMap(Question::getId, Function.identity()));
        Map<Long, EvaluationValue> values = valueRepository.findAllById(dto.getAnswers().stream().map(RequestDtos.AnswerSaveDto::getValueId).toList())
                .stream().collect(Collectors.toMap(EvaluationValue::getId, Function.identity()));

        List<EvaluationAnswer> answers = dto.getAnswers().stream().map(answerDto -> {
            Question question = questions.get(answerDto.getQuestionId());
            if (question == null || !categoryIds.contains(question.getCategory().getId())) {
                throw new IllegalArgumentException("Question does not belong to the selected categories");
            }
            EvaluationValue value = values.get(answerDto.getValueId());
            if (value == null || !value.isActive()) {
                throw new IllegalArgumentException("Invalid evaluation value");
            }
            return EvaluationAnswer.builder()
                    .request(request)
                    .question(question)
                    .initialValue(value)
                    .answerText(answerDto.getAnswerText())
                    .build();
        }).toList();
        answerRepository.saveAll(answers);
    }

    private void validateReadyToSubmit(EvaluationRequest request) {
        List<EvaluationAnswer> answers = answerRepository.findByRequestIdOrderByQuestionDisplayOrderAscIdAsc(request.getId());
        Set<Long> answeredQuestionIds = answers.stream().map(answer -> answer.getQuestion().getId()).collect(Collectors.toSet());
        List<Question> requiredQuestions = request.getCategories().stream()
                .flatMap(category -> questionRepository.findByCategoryIdOrderByDisplayOrderAscIdAsc(category.getId()).stream())
                .filter(Question::isActive)
                .toList();
        if (!answeredQuestionIds.containsAll(requiredQuestions.stream().map(Question::getId).toList())) {
            throw new IllegalStateException("All active questions must be answered before submission");
        }
        for (EvaluationCategory category : request.getCategories()) {
            for (RequiredDocument doc : requiredDocumentRepository.findByCategoryIdOrderByDisplayOrderAscIdAsc(category.getId())) {
                if (doc.isMandatory() && !attachmentRepository.existsByRequestIdAndRequiredDocumentId(request.getId(), doc.getId())) {
                    throw new IllegalStateException("Missing mandatory document: " + doc.getLabelEn());
                }
            }
        }
    }

    private User currentUser(String kcId) {
        return userRepository.findByKcId(kcId)
                .orElseThrow(() -> new NoSuchElementException("Current user profile not found"));
    }

    private EducationalEntity managerEntity(User user) {
        return entityRepository.findByManagerId(user.getId())
                .orElseGet(() -> entityRepository.save(EducationalEntity.builder()
                        .name(user.getFullName() + " Institution")
                        .country("Tunisia")
                        .city("Tunis")
                        .description("Auto-created demo institution for request submission.")
                        .manager(user)
                        .active(true)
                        .build()));
    }

    private String nextRequestNumber() {
        return "REQ-" + Year.now().getValue() + "-" + String.format("%06d", requestRepository.count() + 1);
    }

    private void ensureDraft(EvaluationRequest request) {
        if (request.getStatus() != RequestStatus.DRAFT) {
            throw new IllegalStateException("Only draft requests can be edited");
        }
    }

    private void autoAssignInitial(EvaluationRequest request, User assigner) {
        if (assignmentRepository.findByRequestIdAndStage(request.getId(), RequestAssignment.Stage.INITIAL_EVALUATION).isPresent()) {
            return;
        }
        userRepository.findActiveByRoleCode(Role.EVALUATOR).stream().findFirst()
                .ifPresent(evaluator -> assignmentRepository.save(RequestAssignment.builder()
                        .request(request)
                        .stage(RequestAssignment.Stage.INITIAL_EVALUATION)
                        .assignedUser(evaluator)
                        .assignedBy(assigner)
                        .auto(true)
                        .assignedAt(LocalDateTime.now())
                        .build()));
    }

    private RequestDtos.SummaryDto toSummary(EvaluationRequest request) {
        return new RequestDtos.SummaryDto(
                request.getId(),
                request.getRequestNumber(),
                request.getStatus().name(),
                request.getEntity().getName(),
                request.getCategories().size(),
                answerRepository.findByRequestIdOrderByQuestionDisplayOrderAscIdAsc(request.getId()).size(),
                attachmentRepository.findByRequestIdOrderByCreatedAtDescIdDesc(request.getId()).size(),
                request.getSubmittedAt(),
                request.getCreatedAt());
    }

    private RequestDtos.DetailDto toDetail(EvaluationRequest request) {
        return new RequestDtos.DetailDto(
                request.getId(),
                request.getRequestNumber(),
                request.getStatus().name(),
                request.getEntity().getName(),
                request.getSubmittedAt(),
                request.getCreatedAt(),
                request.getCategories().stream().sorted(Comparator.comparing(EvaluationCategory::getDisplayOrder))
                        .map(category -> new RequestDtos.CategoryDto(
                                category.getId(),
                                category.getCode(),
                                category.getNameAr(),
                                category.getNameEn(),
                                questionRepository.findByCategoryIdOrderByDisplayOrderAscIdAsc(category.getId()).stream()
                                        .filter(Question::isActive)
                                        .map(q -> new RequestDtos.QuestionDto(q.getId(), q.getTextAr(), q.getTextEn(), q.isRequiresAttachment(), q.getDisplayOrder()))
                                        .toList(),
                                requiredDocumentRepository.findByCategoryIdOrderByDisplayOrderAscIdAsc(category.getId()).stream()
                                        .map(doc -> new RequestDtos.RequiredDocumentDto(doc.getId(), doc.getLabelAr(), doc.getLabelEn(), doc.isMandatory(), doc.getDisplayOrder()))
                                        .toList()))
                        .toList(),
                answerRepository.findByRequestIdOrderByQuestionDisplayOrderAscIdAsc(request.getId()).stream()
                        .map(this::toAnswerDto)
                        .toList(),
                attachmentRepository.findByRequestIdOrderByCreatedAtDescIdDesc(request.getId()).stream()
                        .map(this::toAttachmentDto)
                        .toList());
    }

    @Transactional(readOnly = true)
    public RequestDtos.DetailDto toWorkflowDetail(EvaluationRequest request) {
        return toDetail(request);
    }

    private RequestDtos.AnswerDto toAnswerDto(EvaluationAnswer answer) {
        EvaluationValue value = answer.getInitialValue();
        EvaluationValue finalValue = answer.getFinalValue();
        return new RequestDtos.AnswerDto(
                answer.getId(),
                answer.getQuestion().getId(),
                answer.getQuestion().getTextAr(),
                answer.getQuestion().getTextEn(),
                value == null ? null : value.getId(),
                value == null ? null : value.getCode(),
                answer.getAnswerText(),
                finalValue == null ? null : finalValue.getId(),
                finalValue == null ? null : finalValue.getCode(),
                answer.getEvaluatorNote());
    }

    private RequestDtos.AttachmentDto toAttachmentDto(EvaluationAttachment attachment) {
        RequiredDocument doc = attachment.getRequiredDocument();
        return new RequestDtos.AttachmentDto(
                attachment.getId(),
                attachment.getCategory() == null ? null : attachment.getCategory().getId(),
                doc == null ? null : doc.getId(),
                doc == null ? null : doc.getLabelAr(),
                doc == null ? null : doc.getLabelEn(),
                attachment.getOriginalName(),
                attachment.getMimeType(),
                attachment.getSizeBytes(),
                attachment.getCreatedAt());
    }
}
