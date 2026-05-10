package tn.pfe.arabicquality.entities.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTOs liés au cycle de vie d'une demande d'inscription d'institution.
 */
public class RegistrationDtos {

    /** Soumission publique (POST /public/registration-requests). */
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class SubmitDto {
        @NotBlank @Size(max = 200) private String entityName;
        @NotBlank @Size(max = 150) private String managerName;
        @NotBlank @Size(max = 100) private String country;
        @NotBlank @Size(max = 100) private String city;
        @NotBlank @Email @Size(max = 150) private String email;
        @NotBlank @Size(max = 30)  private String phone;
        private String description;
    }

    /** Vue admin (GET /admin/registrations). */
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class AdminViewDto {
        private Long id;
        private String entityName;
        private String managerName;
        private String country;
        private String city;
        private String email;
        private String phone;
        private String description;
        private String status;
        private String rejectionReason;
        private LocalDateTime createdAt;
        private LocalDateTime reviewedAt;
        private String reviewedByEmail;
    }

    /** Approbation (POST /admin/registrations/{id}/approve). */
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ApproveDto {
        private String welcomeNote;       // optionnel — message inclus dans l'email
    }

    /** Rejet (POST /admin/registrations/{id}/reject). */
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RejectDto {
        @NotBlank @Size(max = 1000) private String reason;
    }

    /** Réponse après approbation. */
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ApprovalResultDto {
        private Long registrationId;
        private Long entityId;
        private Long userId;
        private String keycloakUserId;
        private String email;
    }
}
