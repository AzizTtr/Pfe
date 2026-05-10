package tn.pfe.arabicquality.entities.domain;

import jakarta.persistence.*;
import lombok.*;
import tn.pfe.arabicquality.common.BaseEntity;
import tn.pfe.arabicquality.users.domain.User;

/**
 * Institution éducative (الجهة التعليمية) acceptée sur la plateforme.
 * Créée après approbation d'une RegistrationRequest.
 */
@Entity
@Table(name = "educational_entities")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EducationalEntity extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "manager_user_id", nullable = false, unique = true)
    private User manager;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
