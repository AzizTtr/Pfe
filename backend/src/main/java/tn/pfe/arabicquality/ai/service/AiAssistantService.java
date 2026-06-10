package tn.pfe.arabicquality.ai.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.pfe.arabicquality.ai.dto.AiDtos;
import tn.pfe.arabicquality.catalog.domain.EvaluationCategory;
import tn.pfe.arabicquality.catalog.domain.RequiredDocument;
import tn.pfe.arabicquality.catalog.repository.RequiredDocumentRepository;
import tn.pfe.arabicquality.reports.dto.ReportsDtos;
import tn.pfe.arabicquality.reports.service.ReportsDashboardService;
import tn.pfe.arabicquality.requests.domain.EvaluationAnswer;
import tn.pfe.arabicquality.requests.domain.EvaluationAttachment;
import tn.pfe.arabicquality.requests.domain.EvaluationRequest;
import tn.pfe.arabicquality.requests.domain.RequestStatus;
import tn.pfe.arabicquality.requests.repository.EvaluationAnswerRepository;
import tn.pfe.arabicquality.requests.repository.EvaluationAttachmentRepository;
import tn.pfe.arabicquality.requests.repository.EvaluationRequestRepository;
import tn.pfe.arabicquality.users.domain.User;
import tn.pfe.arabicquality.users.repository.UserRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiAssistantService {

    private final EvaluationRequestRepository requestRepository;
    private final EvaluationAnswerRepository answerRepository;
    private final EvaluationAttachmentRepository attachmentRepository;
    private final RequiredDocumentRepository requiredDocumentRepository;
    private final UserRepository userRepository;
    private final ReportsDashboardService reportsDashboardService;

    @Transactional(readOnly = true)
    public AiDtos.SmartReportDto reportForOwner(String kcId, Long requestId, String lang) {
        User user = currentUser(kcId);
        EvaluationRequest request = requestRepository.findByIdAndSubmittedById(requestId, user.getId())
                .orElseThrow(() -> new NoSuchElementException("Request not found: " + requestId));
        return buildSmartReport(request, normalizeLang(lang, user));
    }

    @Transactional(readOnly = true)
    public AiDtos.EvaluationAssistantDto evaluationAssistant(Long requestId) {
        EvaluationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new NoSuchElementException("Request not found: " + requestId));
        List<EvaluationAnswer> answers = answers(request);
        List<AiDtos.EvaluationSuggestionDto> suggestions = answers.stream()
                .map(this::suggest)
                .toList();
        long weakAnswers = suggestions.stream().filter(s -> List.of("C", "D").contains(s.getSuggestedValueCode())).count();
        List<EvaluationAttachment> attachments = attachmentRepository.findByRequestIdOrderByCreatedAtDescIdDesc(requestId);
        int attachmentCount = attachments.size();
        FraudRiskSummary fraud = detectFraudRisks(request, answers, attachments, "en");

        List<String> alerts = new ArrayList<>();
        if (weakAnswers > 0) alerts.add(weakAnswers + " answers may need closer review before approval.");
        if (attachmentCount == 0) alerts.add("No supporting attachments are currently linked to this request.");
        if (answers.stream().anyMatch(a -> blank(a.getAnswerText()))) alerts.add("Some answers have very limited written evidence.");
        alerts.addAll(fraud.alerts());
        if (alerts.isEmpty()) alerts.add("No major automatic risk detected from the available answers.");

        String decision = weakAnswers >= 3 || attachmentCount == 0 || fraud.score() >= 55 ? "REQUEST_INFO" : "APPROVED";
        String note = decision.equals("APPROVED")
                ? "The request looks consistent overall. Confirm evidence quality before final approval."
                : "Please request additional information for copied, weak, missing-document, or under-documented high-score answers before moving forward.";
        return new AiDtos.EvaluationAssistantDto(
                "AI reviewed " + answers.size() + " answers and " + attachmentCount + " attachments for " + request.getEntity().getName() + ".",
                suggestions,
                alerts,
                fraud.alerts(),
                fraud.score(),
                decision,
                note
        );
    }

    @Transactional(readOnly = true)
    public AiDtos.DashboardInsightsDto dashboardInsights() {
        ReportsDtos.DashboardDto dashboard = reportsDashboardService.dashboard();
        long requests = kpi(dashboard, "requests");
        long users = kpi(dashboard, "users");
        long entities = kpi(dashboard, "entities");
        long pendingRegistrations = bucket(dashboard.getRegistrationStatuses(), "PENDING");
        long completed = bucket(dashboard.getRequestStatuses(), "COMPLETED");
        long activeWorkflow = dashboard.getRequestStatuses().stream()
                .filter(bucket -> bucket.getValue() > 0 && !List.of("DRAFT", "COMPLETED").contains(bucket.getKey()))
                .mapToLong(ReportsDtos.BucketDto::getValue)
                .sum();

        List<String> highlights = new ArrayList<>();
        highlights.add(entities + " active institutions and " + users + " active users are currently represented.");
        highlights.add(completed + " completed evaluations can already feed final reports and leaderboard results.");
        dashboard.getCategoryResources().stream()
                .max(Comparator.comparingLong(ReportsDtos.CategoryResourceDto::getQuestionCount))
                .ifPresent(category -> highlights.add(category.getNameEn() + " has the richest question coverage with " + category.getQuestionCount() + " questions."));

        List<String> risks = new ArrayList<>();
        if (pendingRegistrations > 0) risks.add(pendingRegistrations + " registration requests are waiting for admin review.");
        if (activeWorkflow > completed) risks.add("More requests are in progress than completed; reviewer capacity should be watched.");
        if (dashboard.getCategoryResources().stream().anyMatch(category -> category.getQuestionCount() == 0)) {
            risks.add("Some catalog categories still have no questions.");
        }
        if (risks.isEmpty()) risks.add("No critical dashboard risk detected from the current metrics.");

        List<String> recommendations = List.of(
                "Prioritize pending registrations before adding more institutions to the workflow.",
                "Use completed evaluations to calibrate scoring consistency across reviewers.",
                "Keep categories balanced by adding questions where catalog coverage is low."
        );

        return new AiDtos.DashboardInsightsDto(
                "AI scanned " + requests + " evaluation requests, live catalog resources, users, and registration activity.",
                highlights,
                risks,
                recommendations
        );
    }

    private AiDtos.SmartReportDto buildSmartReport(EvaluationRequest request, String lang) {
        boolean ar = "ar".equals(lang);
        List<EvaluationAnswer> answers = answers(request);
        List<EvaluationAttachment> requestAttachments = attachmentRepository.findByRequestIdOrderByCreatedAtDescIdDesc(request.getId());
        int attachments = requestAttachments.size();
        FraudRiskSummary fraud = detectFraudRisks(request, answers, requestAttachments, lang);
        List<String> strongCategories = categoryAverages(answers).entrySet().stream()
                .filter(entry -> entry.getValue().compareTo(BigDecimal.valueOf(75)) >= 0)
                .map(entry -> ar ? entry.getKey().getNameAr() : entry.getKey().getNameEn())
                .limit(4)
                .toList();
        List<String> weakCategories = categoryAverages(answers).entrySet().stream()
                .filter(entry -> entry.getValue().compareTo(BigDecimal.valueOf(75)) < 0)
                .map(entry -> ar ? entry.getKey().getNameAr() : entry.getKey().getNameEn())
                .limit(4)
                .toList();

        BigDecimal percentage = request.getFinalPercentage() == null ? averageScore(answers) : request.getFinalPercentage();
        String scoreText = percentage == null
                ? (ar ? "لم يتم احتسابها بعد" : "not yet calculated")
                : percentage.setScale(1, RoundingMode.HALF_UP) + "%";
        return new AiDtos.SmartReportDto(
                ar ? "تقرير ذكي للطلب " + request.getRequestNumber() : "AI generated report for " + request.getRequestNumber(),
                ar
                        ? "تمت مراجعة طلب " + request.getEntity().getName() + " عبر " + request.getCategories().size()
                        + " فئة، و" + answers.size() + " إجابة، و" + attachments + " ملف إثبات مرفوع. النتيجة الحالية: " + scoreText + "."
                        : "The request for " + request.getEntity().getName() + " was reviewed across " + request.getCategories().size()
                        + " categories, " + answers.size() + " answers, and " + attachments + " uploaded evidence files. Current final result: " + scoreText + ".",
                strongCategories.isEmpty()
                        ? List.of(ar ? "أكملت المؤسسة هيكل التقييم وقدمت إجابات قابلة للمراجعة." : "The institution completed the evaluation structure and provided answers for review.")
                        : strongCategories.stream().map(name -> ar ? "توجد أدلة واتجاه درجات قوي في " + name + "." : "Strong evidence and scoring trend in " + name + ".").toList(),
                weakCategories.isEmpty()
                        ? List.of(ar ? "لم يتم رصد فئة ضعيفة رئيسية من بيانات الدرجات الحالية." : "No major weak category was detected from the final scoring data.")
                        : weakCategories.stream().map(name -> ar ? "يوصى بتحسين فئة " + name + "." : "Improvement recommended in " + name + ".").toList(),
                ar
                        ? List.of(
                        "حافظ على مطابقة ملفات الإثبات مع كل وثيقة مطلوبة.",
                        "استخدم ملاحظات المقيم لتخطيط إجراءات تحسين موجهة.",
                        "راجع الفئات ذات الدرجات المنخفضة قبل دورة التقييم التالية."
                )
                        : List.of(
                        "Keep evidence files aligned with every required document.",
                        "Use evaluator notes to plan targeted improvement actions.",
                        "Review lower-scoring categories before the next evaluation cycle."
                ),
                fraud.alerts(),
                fraud.score(),
                request.getStatus() == RequestStatus.COMPLETED
                        ? (ar ? "اكتمل التقييم ويمكن استخدام التقرير لدعم خطة تحسين المؤسسة." : "The evaluation is complete and the generated report can support institutional improvement planning.")
                        : (ar ? "هذا التقرير ملخص ذكي أولي مبني على بيانات الطلب الحالية ويجب تحديثه بعد احتساب النتيجة النهائية." : "This report is a draft AI summary based on the current request data and should be refreshed after final scoring.")
        );
    }

    private AiDtos.EvaluationSuggestionDto suggest(EvaluationAnswer answer) {
        String initial = answer.getInitialValue() == null ? "C" : answer.getInitialValue().getCode();
        String text = answer.getAnswerText() == null ? "" : answer.getAnswerText().trim();
        String suggested = text.length() < 20 && List.of("A", "B").contains(initial) ? "C" : initial;
        String confidence = text.length() > 80 ? "High" : text.length() > 30 ? "Medium" : "Low";
        String reason = text.length() < 20
                ? "The written answer is short, so the rating should be verified against evidence."
                : "The answer provides enough context to keep the current rating unless attachments contradict it.";
        return new AiDtos.EvaluationSuggestionDto(
                answer.getId(),
                answer.getQuestion().getTextEn(),
                suggested,
                confidence,
                reason,
                "Suggested note: " + reason
        );
    }

    private Map<EvaluationCategory, BigDecimal> categoryAverages(List<EvaluationAnswer> answers) {
        return answers.stream()
                .filter(answer -> valueScore(answer) != null)
                .collect(Collectors.groupingBy(answer -> answer.getQuestion().getCategory(),
                        Collectors.collectingAndThen(Collectors.toList(), this::averageScore)));
    }

    private FraudRiskSummary detectFraudRisks(EvaluationRequest request, List<EvaluationAnswer> answers, List<EvaluationAttachment> attachments, String lang) {
        boolean ar = "ar".equals(lang);
        List<String> alerts = new ArrayList<>();
        int score = 0;

        Map<String, Long> repeatedAnswers = answers.stream()
                .map(answer -> normalizeAnswer(answer.getAnswerText()))
                .filter(text -> text.length() >= 18)
                .collect(Collectors.groupingBy(text -> text, Collectors.counting()));
        long copiedGroups = repeatedAnswers.values().stream().filter(count -> count > 1).count();
        long copiedAnswers = repeatedAnswers.values().stream().filter(count -> count > 1).mapToLong(Long::longValue).sum();
        if (copiedGroups > 0) {
            alerts.add(ar
                    ? copiedAnswers + " إجابة تبدو منسوخة أو مكررة ضمن " + copiedGroups + " نمط نصي متكرر."
                    : copiedAnswers + " answers look copied or repeated across " + copiedGroups + " repeated text pattern(s).");
            score += Math.min(30, 10 + (int) copiedAnswers * 5);
        }

        long weakEvidenceAnswers = answers.stream()
                .filter(answer -> normalizeAnswer(answer.getAnswerText()).length() < 25)
                .count();
        if (weakEvidenceAnswers > 0) {
            alerts.add(ar
                    ? weakEvidenceAnswers + " إجابة تحتوي على دليل كتابي ضعيف أو شبه فارغة."
                    : weakEvidenceAnswers + " answers have weak written evidence or are almost empty.");
            score += Math.min(25, (int) weakEvidenceAnswers * 4);
        }

        Set<Long> uploadedRequiredDocIds = attachments.stream()
                .filter(attachment -> attachment.getRequiredDocument() != null)
                .map(attachment -> attachment.getRequiredDocument().getId())
                .collect(Collectors.toCollection(HashSet::new));
        List<RequiredDocument> mandatoryDocs = request.getCategories().stream()
                .flatMap(category -> requiredDocumentRepository.findByCategoryIdOrderByDisplayOrderAscIdAsc(category.getId()).stream())
                .filter(RequiredDocument::isMandatory)
                .toList();
        long missingMandatoryDocs = mandatoryDocs.stream()
                .filter(document -> !uploadedRequiredDocIds.contains(document.getId()))
                .count();
        if (missingMandatoryDocs > 0) {
            alerts.add(ar
                    ? missingMandatoryDocs + " وثيقة إلزامية مفقودة من أدلة الطلب."
                    : missingMandatoryDocs + " mandatory document(s) are missing from the submitted evidence.");
            score += Math.min(35, 12 + (int) missingMandatoryDocs * 5);
        }

        BigDecimal average = averageScore(answers);
        long highRatedWeakAnswers = answers.stream()
                .filter(answer -> List.of("A", "B").contains(valueCode(answer)))
                .filter(answer -> normalizeAnswer(answer.getAnswerText()).length() < 35)
                .count();
        boolean highScoreLowProof = average.compareTo(BigDecimal.valueOf(85)) >= 0
                && (attachments.size() < Math.max(1, request.getCategories().size()) || missingMandatoryDocs > 0 || highRatedWeakAnswers > 0);
        if (highScoreLowProof) {
            alerts.add(ar
                    ? "يوجد اتجاه درجات مرتفع بشكل غير معتاد مع أدلة محدودة أو وثائق ناقصة أو إجابات قصيرة ذات تقييم عال."
                    : "The request has an unusually high score trend with limited proof, missing documents, or short high-rated answers.");
            score += 30;
        }
        if (highRatedWeakAnswers > 0) {
            alerts.add(ar
                    ? highRatedWeakAnswers + " إجابة ذات تقييم عال تحتوي على شرح قليل ويجب التحقق منها مقابل الأدلة."
                    : highRatedWeakAnswers + " high-rated answer(s) have too little explanation and should be verified against evidence.");
            score += Math.min(20, (int) highRatedWeakAnswers * 4);
        }

        if (alerts.isEmpty()) {
            alerts.add(ar
                    ? "لم يتم رصد نمط احتيال من الإجابات المكررة أو تغطية الأدلة أو الوثائق الناقصة أو فحص الدرجات المرتفعة."
                    : "No fraud pattern detected from copied answers, evidence coverage, missing documents, or high-score proof checks.");
        }
        return new FraudRiskSummary(Math.min(100, score), alerts);
    }

    private BigDecimal averageScore(List<EvaluationAnswer> answers) {
        List<BigDecimal> scores = answers.stream().map(this::valueScore).filter(score -> score != null).toList();
        if (scores.isEmpty()) return BigDecimal.ZERO;
        BigDecimal total = scores.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return total.divide(BigDecimal.valueOf(scores.size()), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal valueScore(EvaluationAnswer answer) {
        if (answer.getFinalValue() != null) return answer.getFinalValue().getNumericScore();
        if (answer.getInitialValue() != null) return answer.getInitialValue().getNumericScore();
        return null;
    }

    private String valueCode(EvaluationAnswer answer) {
        if (answer.getFinalValue() != null) return answer.getFinalValue().getCode();
        if (answer.getInitialValue() != null) return answer.getInitialValue().getCode();
        return "";
    }

    private List<EvaluationAnswer> answers(EvaluationRequest request) {
        return answerRepository.findByRequestIdOrderByQuestionDisplayOrderAscIdAsc(request.getId());
    }

    private long kpi(ReportsDtos.DashboardDto dashboard, String key) {
        return dashboard.getKpis().stream().filter(kpi -> key.equals(kpi.getKey())).findFirst().map(ReportsDtos.KpiDto::getValue).orElse(0L);
    }

    private long bucket(List<ReportsDtos.BucketDto> buckets, String key) {
        return buckets.stream().filter(bucket -> key.equals(bucket.getKey())).findFirst().map(ReportsDtos.BucketDto::getValue).orElse(0L);
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }

    private String normalizeAnswer(String value) {
        if (value == null) return "";
        return value.toLowerCase()
                .replaceAll("[^\\p{IsAlphabetic}\\p{IsDigit}]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
    }

    private User currentUser(String kcId) {
        return userRepository.findByKcId(kcId)
                .orElseThrow(() -> new NoSuchElementException("Current user profile not found"));
    }

    private String normalizeLang(String lang, User user) {
        if ("ar".equalsIgnoreCase(lang)) return "ar";
        if ("en".equalsIgnoreCase(lang)) return "en";
        return user.getPreferredLang() == User.Language.en ? "en" : "ar";
    }

    private record FraudRiskSummary(int score, List<String> alerts) {}
}
