package tn.pfe.arabicquality.catalog.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class CatalogDtos {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CategoryDto {
        private Long id;
        private String code;
        private String nameAr;
        private String nameEn;
        private String descriptionAr;
        private String descriptionEn;
        private Integer displayOrder;
        private boolean active;
        private int questionCount;
        private long requiredDocumentCount;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CategorySaveDto {
        @NotBlank @Size(max = 50) private String code;
        @NotBlank @Size(max = 150) private String nameAr;
        @NotBlank @Size(max = 150) private String nameEn;
        private String descriptionAr;
        private String descriptionEn;
        @NotNull private Integer displayOrder;
        private Boolean active;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class QuestionDto {
        private Long id;
        private Long categoryId;
        private String categoryCode;
        private String categoryNameAr;
        private String categoryNameEn;
        private String textAr;
        private String textEn;
        private boolean requiresAttachment;
        private Integer displayOrder;
        private boolean active;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class QuestionSaveDto {
        @NotNull private Long categoryId;
        @NotBlank private String textAr;
        @NotBlank private String textEn;
        private boolean requiresAttachment;
        @NotNull private Integer displayOrder;
        private Boolean active;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ValueDto {
        private Long id;
        private String code;
        private String labelAr;
        private String labelEn;
        private BigDecimal numericScore;
        private Integer displayOrder;
        private boolean active;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ValueSaveDto {
        @NotBlank @Size(max = 10) private String code;
        @NotBlank @Size(max = 100) private String labelAr;
        @NotBlank @Size(max = 100) private String labelEn;
        @NotNull @DecimalMin("0.00") private BigDecimal numericScore;
        @NotNull private Integer displayOrder;
        private Boolean active;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RequiredDocumentDto {
        private Long id;
        private Long categoryId;
        private String labelAr;
        private String labelEn;
        private boolean mandatory;
        private Integer displayOrder;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RequiredDocumentSaveDto {
        @NotBlank @Size(max = 200) private String labelAr;
        @NotBlank @Size(max = 200) private String labelEn;
        private boolean mandatory;
        @NotNull private Integer displayOrder;
    }
}
