package tn.pfe.arabicquality.users.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tn.pfe.arabicquality.users.domain.User;
import tn.pfe.arabicquality.users.dto.UserDtos;
import tn.pfe.arabicquality.users.repository.UserRepository;
import tn.pfe.arabicquality.users.service.KeycloakAdminService;
import tn.pfe.arabicquality.users.service.UserSyncService;

import java.util.Map;

/**
 * Endpoints liés au profil utilisateur courant.
 *
 *  - GET    /users/me                         — retourne le profil
 *  - PATCH  /users/me                         — met à jour fullName / phone / preferredLang
 *  - POST   /users/me/request-password-reset  — déclenche email Keycloak "reset password"
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserRepository userRepository;
    private final KeycloakAdminService keycloakAdmin;
    private final UserSyncService userSyncService;

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal Jwt jwt) {
        User user = userRepository.findByKcId(jwt.getSubject())
                .orElseGet(() -> userSyncService.syncFromJwt(jwt));
        return ResponseEntity.ok(toView(user));
    }

    @PatchMapping("/me")
    public ResponseEntity<?> updateMe(@AuthenticationPrincipal Jwt jwt,
                                      @Valid @RequestBody UpdateMeDto dto) {
        try {
            User user = userRepository.findByKcId(jwt.getSubject())
                    .orElseGet(() -> userSyncService.syncFromJwt(jwt));

            if (dto.getFullName() != null) {
                String fullName = clean(dto.getFullName());
                if (fullName.isBlank()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Full name is required"));
                }
                user.setFullName(fullName);
            }
            if (dto.getPhone() != null) {
                user.setPhone(nullableClean(dto.getPhone()));
            }
            if (dto.getAvatarUrl() != null) {
                user.setAvatarUrl(nullableClean(dto.getAvatarUrl()));
            }
            if (dto.getAvatarColor() != null && !dto.getAvatarColor().isBlank()) {
                user.setAvatarColor(clean(dto.getAvatarColor()));
            }
            if (dto.getJobTitle() != null) {
                user.setJobTitle(nullableClean(dto.getJobTitle()));
            }
            if (dto.getOrganization() != null) {
                user.setOrganization(nullableClean(dto.getOrganization()));
            }
            if (dto.getBio() != null) {
                user.setBio(nullableClean(dto.getBio()));
            }
            if (dto.getTimezone() != null && !dto.getTimezone().isBlank()) {
                user.setTimezone(clean(dto.getTimezone()));
            }
            if (dto.getDashboardDensity() != null) {
                try {
                    user.setDashboardDensity(User.DashboardDensity.valueOf(clean(dto.getDashboardDensity())));
                } catch (IllegalArgumentException ignored) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid dashboard density"));
                }
            }
            if (dto.getEmailNotifications() != null) {
                user.setEmailNotifications(dto.getEmailNotifications());
            }
            if (dto.getPreferredLang() != null) {
                try {
                    user.setPreferredLang(User.Language.valueOf(clean(dto.getPreferredLang())));
                } catch (IllegalArgumentException ignored) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid language"));
                }
            }
            userRepository.save(user);
            log.info("User #{} updated own profile", user.getId());
            return ResponseEntity.ok(toView(user));
        } catch (Exception e) {
            log.error("Failed to update profile for kcId={} : {}", jwt.getSubject(), e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Could not save profile changes"));
        }
    }

    @PostMapping("/me/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@AuthenticationPrincipal Jwt jwt) {
        User user = userRepository.findByKcId(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("Profil non trouvé"));
        try {
            keycloakAdmin.sendPasswordResetEmail(user.getKcId());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Failed to trigger password reset for user #{} : {}", user.getId(), e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Could not send reset email"));
        }
    }

    private Map<String, Object> toView(User user) {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id",            user.getId());
        map.put("kcId",          user.getKcId());
        map.put("email",         user.getEmail());
        map.put("fullName",      user.getFullName());
        map.put("phone",         user.getPhone() == null ? "" : user.getPhone());
        map.put("avatarUrl",     user.getAvatarUrl() == null ? "" : user.getAvatarUrl());
        map.put("avatarColor",   user.getAvatarColor());
        map.put("jobTitle",      user.getJobTitle() == null ? "" : user.getJobTitle());
        map.put("organization",  user.getOrganization() == null ? "" : user.getOrganization());
        map.put("bio",           user.getBio() == null ? "" : user.getBio());
        map.put("role",          user.getRole().getCode());
        map.put("preferredLang", user.getPreferredLang().name());
        map.put("timezone",      user.getTimezone());
        map.put("dashboardDensity", user.getDashboardDensity().name());
        map.put("emailNotifications", user.isEmailNotifications());
        map.put("lastLoginAt",   user.getLastLoginAt());
        return map;
    }

    @Data
    public static class UpdateMeDto {
        @Size(max = 150) private String fullName;
        @Size(max = 30)  private String phone;
        @Size(max = 1000000) private String avatarUrl;
        @Size(max = 20)  private String avatarColor;
        @Size(max = 120) private String jobTitle;
        @Size(max = 160) private String organization;
        @Size(max = 500) private String bio;
        @Size(max = 80)  private String timezone;
        @Size(max = 20)  private String dashboardDensity;
        private Boolean emailNotifications;
        @Size(max = 5)   private String preferredLang;   // ar | en
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private String nullableClean(String value) {
        String cleaned = clean(value);
        return cleaned.isBlank() ? null : cleaned;
    }
}
