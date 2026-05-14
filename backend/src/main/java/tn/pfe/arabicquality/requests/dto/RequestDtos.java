package tn.pfe.arabicquality.requests.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class RequestDtos {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CatalogDto {
        private List<CategoryDto> categories;
        private List<ValueDto> values;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CategoryDto {
        private Long id;
        private String code;
        private String nameAr;
        private String nameEn;
        private List<QuestionDto> questions;
        private List<RequiredDocumentDto> requiredDocuments;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class QuestionDto {
        private Long id;
        private String textAr;
        private String textEn;
        private boolean requiresAttachment;
        private Integer displayOrder;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RequiredDocumentDto {
        private Long id;
        private String labelAr;
        private String labelEn;
        private boolean mandatory;
        private Integer displayOrder;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ValueDto {
        private Long id;
        private String code;
        private String labelAr;
        private String labelEn;
        private Integer displayOrder;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class SaveRequestDto {
        @NotEmpty private List<Long> categoryIds;
        @Valid @NotEmpty private List<AnswerSaveDto> answers;
        private boolean submit;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class AnswerSaveDto {
        @NotNull private Long questionId;
        @NotNull private Long valueId;
        private String answerText;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class SummaryDto {
        private Long id;
        private String requestNumber;
        private String status;
        private String entityName;
        private int categoryCount;
        private int answerCount;
        private int attachmentCount;
        private LocalDateTime submittedAt;
        private LocalDateTime createdAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class DetailDto {
        private Long id;
        private String requestNumber;
        private String status;
        private String entityName;
        private LocalDateTime submittedAt;
        private LocalDateTime createdAt;
        private List<CategoryDto> categories;
        private List<AnswerDto> answers;
        private List<AttachmentDto> attachments;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class AnswerDto {
        private Long id;
        private Long questionId;
        private String questionTextAr;
        private String questionTextEn;
        private Long valueId;
        private String valueCode;
        private String answerText;
        private Long finalValueId;
        private String finalValueCode;
        private String evaluatorNote;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class AssignmentDto {
        private Long id;
        private Long requestId;
        private String requestNumber;
        private String entityName;
        private String status;
        private String stage;
        private Long assignedUserId;
        private String assignedUserName;
        private String assignedUserEmail;
        private boolean auto;
        private LocalDateTime assignedAt;
        private LocalDateTime completedAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class DecisionDto {
        private Long id;
        private String stage;
        private String decision;
        private String notes;
        private String decidedByName;
        private LocalDateTime decidedAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class WorkflowDetailDto {
        private DetailDto request;
        private List<ValueDto> values;
        private List<AssignmentDto> assignments;
        private List<DecisionDto> decisions;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class AnswerReviewDto {
        @NotNull private Long finalValueId;
        private String evaluatorNote;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class DecisionSaveDto {
        @NotNull private String decision;
        private String notes;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class AssignDto {
        @NotNull private Long requestId;
        @NotNull private String stage;
        @NotNull private Long assignedUserId;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ReviewerDto {
        private Long id;
        private String fullName;
        private String email;
        private String roleCode;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class AttachmentDto {
        private Long id;
        private Long categoryId;
        private Long requiredDocumentId;
        private String requiredDocumentLabelAr;
        private String requiredDocumentLabelEn;
        private String originalName;
        private String mimeType;
        private Long sizeBytes;
        private LocalDateTime createdAt;
    }
}
