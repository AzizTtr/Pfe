package tn.pfe.arabicquality.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class UserDtos {

    /** Vue admin d'un utilisateur. */
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class AdminViewDto {
        private Long id;
        private String kcId;
        private String email;
        private String fullName;
        private String phone;
        private String role;            // code : ROLE_*
        private String roleNameAr;
        private String roleNameEn;
        private boolean active;
        private String preferredLang;
        private LocalDateTime lastLoginAt;
        private LocalDateTime createdAt;
    }

    /** Création d'un utilisateur (admin → Keycloak). */
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CreateDto {
        @NotBlank @Email @Size(max = 150) private String email;
        @NotBlank @Size(max = 150) private String fullName;
        @NotBlank @Size(max = 50)  private String role;     // ROLE_EVALUATOR, etc.
        @Size(max = 30)            private String phone;
    }

    /** Édition d'un utilisateur (champs modifiables). */
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UpdateDto {
        @Size(max = 150) private String fullName;
        @Size(max = 30)  private String phone;
        @Size(max = 50)  private String role;
        private String   preferredLang;   // ar | en
    }

    /** Réponse après création. */
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CreateResultDto {
        private Long id;
        private String kcId;
        private String email;
    }
}
