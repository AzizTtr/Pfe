package tn.pfe.arabicquality.users.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.pfe.arabicquality.users.domain.Role;
import tn.pfe.arabicquality.users.domain.User;
import tn.pfe.arabicquality.users.repository.RoleRepository;
import tn.pfe.arabicquality.users.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Synchronise les utilisateurs Keycloak avec la table locale {@code users}.
 *  - Au premier login : crée l'enregistrement local (lazy provisioning).
 *  - À chaque login : met à jour {@code lastLoginAt} et corrige email/nom si modifiés Keycloak.
 *
 * Le rôle métier est dérivé du premier rôle "ROLE_*" trouvé dans le claim realm_access.roles.
 * Si plusieurs rôles applicatifs sont présents, on prend le plus privilégié.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserSyncService {

    private static final List<String> ROLE_PRIORITY = List.of(
            Role.PLATFORM_ADMIN,
            Role.FIELD_REVIEWER,
            Role.ADMIN_REVIEWER,
            Role.EVALUATOR,
            Role.ENTITY_MANAGER
    );

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional
    public User syncFromJwt(Jwt jwt) {
        String kcId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        String fullName = buildFullName(jwt);
        String roleCode = pickHighestRole(jwt);

        if (kcId == null || email == null) {
            throw new IllegalStateException("JWT manque sub ou email");
        }

        Role role = roleRepository.findByCode(roleCode)
                .orElseThrow(() -> new IllegalStateException("Role inconnu : " + roleCode));

        User user = userRepository.findByKcId(kcId).orElse(null);
        if (user == null) {
            user = User.builder()
                    .kcId(kcId)
                    .email(email)
                    .fullName(fullName)
                    .role(role)
                    .preferredLang(User.Language.ar)
                    .active(true)
                    .lastLoginAt(LocalDateTime.now())
                    .build();
            user = userRepository.save(user);
            log.info("Created local profile for kcId={} email={}", kcId, email);
        } else {
            boolean changed = false;
            if (!Objects.equals(user.getEmail(), email)) { user.setEmail(email); changed = true; }
            if (!Objects.equals(user.getFullName(), fullName)) { user.setFullName(fullName); changed = true; }
            if (!Objects.equals(user.getRole().getCode(), roleCode)) { user.setRole(role); changed = true; }
            user.setLastLoginAt(LocalDateTime.now());
            if (changed) log.debug("Updated local profile for kcId={}", kcId);
        }
        return user;
    }

    private String buildFullName(Jwt jwt) {
        String name = jwt.getClaimAsString("name");
        if (name != null && !name.isBlank()) return name;
        String given = jwt.getClaimAsString("given_name");
        String family = jwt.getClaimAsString("family_name");
        if (given != null || family != null) return ((given == null ? "" : given) + " " + (family == null ? "" : family)).trim();
        return jwt.getClaimAsString("preferred_username");
    }

    @SuppressWarnings("unchecked")
    private String pickHighestRole(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess == null) return Role.ENTITY_MANAGER;
        List<String> roles = (List<String>) realmAccess.get("roles");
        if (roles == null) return Role.ENTITY_MANAGER;

        for (String pref : ROLE_PRIORITY) {
            if (roles.contains(pref)) return pref;
        }
        return Role.ENTITY_MANAGER;
    }
}
