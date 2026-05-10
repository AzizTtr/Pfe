package tn.pfe.arabicquality.users.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.pfe.arabicquality.audit.Audit;
import tn.pfe.arabicquality.users.domain.Role;
import tn.pfe.arabicquality.users.domain.User;
import tn.pfe.arabicquality.users.dto.UserDtos;
import tn.pfe.arabicquality.users.repository.RoleRepository;
import tn.pfe.arabicquality.users.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;

/**
 * Gestion des utilisateurs (Feature 15).
 * Tous les changements sont propagés à Keycloak via {@link KeycloakAdminService}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserManagementService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final KeycloakAdminService keycloakAdmin;

    @Transactional(readOnly = true)
    public Page<UserDtos.AdminViewDto> list(String role, String search, Pageable pageable) {
        return userRepo.search(role, search, pageable).map(this::toView);
    }

    @Transactional
    @Audit(action = "CREATE", entity = "user", description = "User created by admin")
    public UserDtos.CreateResultDto create(UserDtos.CreateDto dto) {
        if (userRepo.existsByEmail(dto.getEmail())) {
            throw new IllegalStateException("Email already used : " + dto.getEmail());
        }
        Role role = roleRepo.findByCode(dto.getRole())
                .orElseThrow(() -> new IllegalArgumentException("Unknown role : " + dto.getRole()));

        // Split fullName for Keycloak
        String[] parts = dto.getFullName().trim().split("\\s+", 2);
        String firstName = parts[0];
        String lastName  = parts.length > 1 ? parts[1] : "—";

        String kcId = keycloakAdmin.createUser(dto.getEmail(), firstName, lastName, role.getCode());

        User u = User.builder()
                .kcId(kcId)
                .email(dto.getEmail())
                .fullName(dto.getFullName())
                .phone(dto.getPhone())
                .role(role)
                .preferredLang(User.Language.ar)
                .active(true)
                .build();
        u = userRepo.save(u);

        log.info("Admin created user #{} ({}) role {}", u.getId(), u.getEmail(), role.getCode());
        return new UserDtos.CreateResultDto(u.getId(), u.getKcId(), u.getEmail());
    }

    @Transactional
    @Audit(action = "UPDATE", entity = "user", description = "User updated")
    public UserDtos.AdminViewDto update(Long id, UserDtos.UpdateDto dto) {
        User u = userRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found : " + id));

        if (dto.getFullName() != null && !dto.getFullName().isBlank()) u.setFullName(dto.getFullName());
        if (dto.getPhone()    != null) u.setPhone(dto.getPhone());
        if (dto.getRole() != null && !dto.getRole().isBlank()) {
            Role role = roleRepo.findByCode(dto.getRole())
                    .orElseThrow(() -> new IllegalArgumentException("Unknown role : " + dto.getRole()));
            u.setRole(role);
            keycloakAdmin.assignRealmRole(u.getKcId(), role.getCode());
        }
        if (dto.getPreferredLang() != null) {
            try { u.setPreferredLang(User.Language.valueOf(dto.getPreferredLang())); }
            catch (IllegalArgumentException ignored) {}
        }
        return toView(userRepo.save(u));
    }

    @Transactional
    @Audit(action = "DEACTIVATE", entity = "user")
    public void setActive(Long id, boolean active) {
        User u = userRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found : " + id));
        u.setActive(active);
        u.setDeletedAt(active ? null : LocalDateTime.now());
        userRepo.save(u);
        keycloakAdmin.setEnabled(u.getKcId(), active);
        log.info("User #{} {} → Keycloak synced", id, active ? "reactivated" : "deactivated");
    }

    private UserDtos.AdminViewDto toView(User u) {
        return new UserDtos.AdminViewDto(
                u.getId(), u.getKcId(), u.getEmail(), u.getFullName(), u.getPhone(),
                u.getRole().getCode(), u.getRole().getNameAr(), u.getRole().getNameEn(),
                u.isActive(), u.getPreferredLang().name(),
                u.getLastLoginAt(), u.getCreatedAt());
    }
}
