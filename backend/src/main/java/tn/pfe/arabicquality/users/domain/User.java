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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_lang", nullable = false, length = 5)
    private Language preferredLang = Language.ar;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum Language { ar, en }
}
