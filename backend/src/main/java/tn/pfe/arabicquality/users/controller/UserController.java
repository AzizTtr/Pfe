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
        User user = userRepository.findByKcId(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("Profil non trouvé"));

        if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
            user.setFullName(dto.getFullName());
        }
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }
        if (dto.getPreferredLang() != null) {
            try {
                user.setPreferredLang(User.Language.valueOf(dto.getPreferredLang()));
            } catch (IllegalArgumentException ignored) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid language"));
            }
        }
        userRepository.save(user);
        log.info("User #{} updated own profile", user.getId());
        return ResponseEntity.ok(toView(user));
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
        map.put("role",          user.getRole().getCode());
        map.put("preferredLang", user.getPreferredLang().name());
        map.put("lastLoginAt",   user.getLastLoginAt());
        return map;
    }

    @Data
    public static class UpdateMeDto {
        @Size(max = 150) private String fullName;
        @Size(max = 30)  private String phone;
        @Size(max = 5)   private String preferredLang;   // ar | en
    }
}
