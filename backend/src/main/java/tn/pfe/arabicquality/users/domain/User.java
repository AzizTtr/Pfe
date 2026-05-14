package tn.pfe.arabicquality.users.domain;

import jakarta.persistence.*;
import lombok.*;
import tn.pfe.arabicquality.common.BaseEntity;

import java.time.LocalDateTime;

/**
 * Profil métier d'un utilisateur authentifié via Keycloak.
 * Le champ {@code kcId} référence l'UUID Keycloak (claim {@code sub} du JWT).
 * Aucun mot de passe stocké ici.
 */
@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class User extends BaseEntity {

    /** UUID Keycloak (claim "sub"). */
    @Column(name = "kc_id", nullable = false, unique = true, length = 36)
    private String kcId;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(length = 30)
    private String phone;

    @Lob
    @Column(name = "avatar_url", columnDefinition = "MEDIUMTEXT")
    private String avatarUrl;

    @Column(name = "avatar_color", nullable = false, length = 20)
    @Builder.Default
    private String avatarColor = "#0f766e";

    @Column(name = "job_title", length = 120)
    private String jobTitle;

    @Column(length = 160)
    private String organization;

    @Column(length = 500)
    private String bio;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_lang", nullable = false, length = 5)
    @Builder.Default
    private Language preferredLang = Language.ar;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(nullable = false, length = 80)
    @Builder.Default
    private String timezone = "Africa/Tunis";

    @Enumerated(EnumType.STRING)
    @Column(name = "dashboard_density", nullable = false, length = 20)
    @Builder.Default
    private DashboardDensity dashboardDensity = DashboardDensity.comfortable;

    @Column(name = "email_notifications", nullable = false)
    @Builder.Default
    private boolean emailNotifications = true;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum Language { ar, en }

    public enum DashboardDensity { comfortable, compact }
}
