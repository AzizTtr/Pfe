package tn.pfe.arabicquality.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ReportsDtos {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class DashboardDto {
        private List<KpiDto> kpis;
        private List<BucketDto> registrationStatuses;
        private List<BucketDto> requestStatuses;
        private List<BucketDto> userRoles;
        private List<CategoryResourceDto> categoryResources;
        private List<ValueScaleDto> valueScale;
        private List<RecentRegistrationDto> recentRegistrations;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class KpiDto {
        private String key;
        private String label;
        private long value;
        private String suffix;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class BucketDto {
        private String key;
        private String label;
        private long value;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CategoryResourceDto {
        private Long id;
        private String code;
        private String nameAr;
        private String nameEn;
        private long questionCount;
        private long requiredDocumentCount;
        private boolean active;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ValueScaleDto {
        private String code;
        private String labelAr;
        private String labelEn;
        private BigDecimal numericScore;
        private boolean active;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RecentRegistrationDto {
        private Long id;
        private String entityName;
        private String managerName;
        private String country;
        private String city;
        private String status;
        private LocalDateTime createdAt;
    }
}
