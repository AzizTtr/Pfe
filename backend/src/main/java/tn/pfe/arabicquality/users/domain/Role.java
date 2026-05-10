package tn.pfe.arabicquality.users.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name_ar", nullable = false, length = 100)
    private String nameAr;

    @Column(name = "name_en", nullable = false, length = 100)
    private String nameEn;

    private String description;

    /** Codes alignés sur les realm-roles Keycloak. */
    public static final String ENTITY_MANAGER  = "ROLE_ENTITY_MANAGER";
    public static final String EVALUATOR       = "ROLE_EVALUATOR";
    public static final String ADMIN_REVIEWER  = "ROLE_ADMIN_REVIEWER";
    public static final String FIELD_REVIEWER  = "ROLE_FIELD_REVIEWER";
    public static final String PLATFORM_ADMIN  = "ROLE_PLATFORM_ADMIN";
}
