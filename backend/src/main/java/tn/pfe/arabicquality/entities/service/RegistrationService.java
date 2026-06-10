package tn.pfe.arabicquality.entities.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.pfe.arabicquality.audit.Audit;
import tn.pfe.arabicquality.entities.domain.EducationalEntity;
import tn.pfe.arabicquality.entities.domain.RegistrationRequest;
import tn.pfe.arabicquality.entities.dto.RegistrationDtos;
import tn.pfe.arabicquality.entities.repository.EducationalEntityRepository;
import tn.pfe.arabicquality.entities.repository.RegistrationRequestRepository;
import tn.pfe.arabicquality.notifications.EmailService;
import tn.pfe.arabicquality.users.domain.Role;
import tn.pfe.arabicquality.users.domain.User;
import tn.pfe.arabicquality.users.repository.RoleRepository;
import tn.pfe.arabicquality.users.repository.UserRepository;
import tn.pfe.arabicquality.users.service.KeycloakAdminService;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * Workflow d'inscription d'une institution éducative.
 * Soumission (publique) :
 *   {@link #submit(RegistrationDtos.SubmitDto)}
 *
 * Approbation (Platform Admin) — orchestre :
 *   1. Création d'un user dans Keycloak (via {@link KeycloakAdminService})
 *   2. Insertion d'un User local lié au kc_id
 *   3. Création de l'EducationalEntity rattachée à ce user
 *   4. Mise à jour de la registration_request → APPROVED
 *   5. Envoi d'un email de bienvenue avec le lien "Set up password"
 * Rejet : marque la demande REJECTED, envoie un email avec la raison.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RegistrationService {

    private final RegistrationRequestRepository regRepo;
    private final EducationalEntityRepository   entityRepo;
    private final UserRepository                userRepo;
    private final RoleRepository                roleRepo;
    private final KeycloakAdminService          keycloakAdmin;
    private final EmailService                  emailService;

    // ─────────────────────────────────────────────────────────────────
    //  Public — soumission
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    @Audit(action = "CREATE", entity = "registration_request", description = "New registration submitted")
    public Long submit(RegistrationDtos.SubmitDto dto) {
        if (regRepo.existsByEmailAndStatus(dto.getEmail(), RegistrationRequest.Status.PENDING)) {
            throw new IllegalStateException("A pending registration already exists for this email");
        }
        RegistrationRequest req = RegistrationRequest.builder()
                .entityName(dto.getEntityName())
                .managerName(dto.getManagerName())
                .country(dto.getCountry())
                .city(dto.getCity())
                .email(dto.getEmail().toLowerCase().trim())
                .phone(dto.getPhone())
                .description(dto.getDescription())
                .status(RegistrationRequest.Status.PENDING)
                .build();
        req = regRepo.save(req);
        log.info("Registration submitted #{} for entity '{}'", req.getId(), req.getEntityName());
        return req.getId();
    }

    // ─────────────────────────────────────────────────────────────────
    //  Admin — listing
    // ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<RegistrationDtos.AdminViewDto> list(RegistrationRequest.Status status, Pageable pageable) {
        Page<RegistrationRequest> page = (status != null)
                ? regRepo.findByStatusOrderByCreatedAtDesc(status, pageable)
                : regRepo.findAll(pageable);
        return page.map(this::toAdminView);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> counts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (RegistrationRequest.Status status : RegistrationRequest.Status.values()) {
            counts.put(status.name(), regRepo.countByStatus(status));
        }
        counts.put("TOTAL", counts.values().stream().mapToLong(Long::longValue).sum());
        return counts;
    }

    // ─────────────────────────────────────────────────────────────────
    //  Admin — approve
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    @Audit(action = "APPROVE", entity = "registration_request", description = "Registration approved")
    public RegistrationDtos.ApprovalResultDto approve(Long id, RegistrationDtos.ApproveDto cmd) {
        RegistrationRequest req = regRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Registration not found: " + id));

        if (req.getStatus() != RegistrationRequest.Status.PENDING) {
            throw new IllegalStateException("Registration is not pending: " + req.getStatus());
        }

        // Sécurité : éviter de recréer si le user existe déjà
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new IllegalStateException("A user with this email already exists");
        }

        // 1. Création Keycloak — split firstName/lastName pour Keycloak
        String[] parts = req.getManagerName().trim().split("\\s+", 2);
        String firstName = parts[0];
        String lastName  = parts.length > 1 ? parts[1] : "—";
        String kcId = keycloakAdmin.createUser(req.getEmail(), firstName, lastName, Role.ENTITY_MANAGER);

        // 2. Profil métier local
        Role role = roleRepo.findByCode(Role.ENTITY_MANAGER)
                .orElseThrow(() -> new IllegalStateException("Role ENTITY_MANAGER not found"));
        User user = User.builder()
                .kcId(kcId)
                .email(req.getEmail())
                .fullName(req.getManagerName())
                .phone(req.getPhone())
                .role(role)
                .preferredLang(User.Language.ar)
                .active(true)
                .build();
        user = userRepo.save(user);

        // 3. Educational entity
        EducationalEntity entity = EducationalEntity.builder()
                .name(req.getEntityName())
                .country(req.getCountry())
                .city(req.getCity())
                .description(req.getDescription())
                .manager(user)
                .active(true)
                .build();
        entity = entityRepo.save(entity);

        // 4. Update registration request
        req.setStatus(RegistrationRequest.Status.APPROVED);
        req.setReviewedAt(LocalDateTime.now());
        req.setReviewedBy(currentUserOrNull());
        regRepo.save(req);

        // 5. Email de bienvenue — async, ne casse jamais la transaction
        try {
            emailService.sendWelcome(req.getEmail(), req.getManagerName(), req.getEntityName(),
                    cmd != null ? cmd.getWelcomeNote() : null);
        } catch (Exception e) {
            log.warn("Welcome email failed (non-blocking) for {} : {}", req.getEmail(), e.getMessage());
        }

        log.info("✓ Approved registration #{} → user #{} entity #{} kcId={}",
                req.getId(), user.getId(), entity.getId(), kcId);

        return new RegistrationDtos.ApprovalResultDto(
                req.getId(), entity.getId(), user.getId(), kcId, user.getEmail());
    }

    // ─────────────────────────────────────────────────────────────────
    //  Admin — reject
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    @Audit(action = "REJECT", entity = "registration_request", description = "Registration rejected")
    public void reject(Long id, RegistrationDtos.RejectDto cmd) {
        RegistrationRequest req = regRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Registration not found: " + id));

        if (req.getStatus() != RegistrationRequest.Status.PENDING) {
            throw new IllegalStateException("Registration is not pending: " + req.getStatus());
        }

        req.setStatus(RegistrationRequest.Status.REJECTED);
        req.setRejectionReason(cmd.getReason());
        req.setReviewedAt(LocalDateTime.now());
        req.setReviewedBy(currentUserOrNull());
        regRepo.save(req);

        emailService.sendRejection(req.getEmail(), req.getManagerName(), req.getEntityName(), cmd.getReason());
        log.info("Rejected registration #{} ({})", req.getId(), cmd.getReason());
    }

    // ─────────────────────────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────────────────────────

    private User currentUserOrNull() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            return userRepo.findByKcId(jwtAuth.getToken().getSubject()).orElse(null);
        }
        return null;
    }

    private RegistrationDtos.AdminViewDto toAdminView(RegistrationRequest r) {
        return new RegistrationDtos.AdminViewDto(
                r.getId(), r.getEntityName(), r.getManagerName(),
                r.getCountry(), r.getCity(), r.getEmail(), r.getPhone(), r.getDescription(),
                r.getStatus().name(), r.getRejectionReason(),
                r.getCreatedAt(), r.getReviewedAt(),
                r.getReviewedBy() != null ? r.getReviewedBy().getEmail() : null);
    }
}
