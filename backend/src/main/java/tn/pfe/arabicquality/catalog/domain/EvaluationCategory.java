package tn.pfe.arabicquality.catalog.domain;

import jakarta.persistence.*;
import lombok.*;
import tn.pfe.arabicquality.common.BaseEntity;

import java.util.HashSet;
import java.util.Set;

/**
 * Catégorie d'évaluation (ex : Curricula, Cadre éducatif, Environnement éducatif…).
 * Feature 16.
 */
@Entity
@Table(name = "evaluation_categories")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EvaluationCategory extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name_ar", nullable = false, length = 150)
    private String nameAr;

    @Column(name = "name_en", nullable = false, length = 150)
    private String nameEn;

    @Column(name = "description_ar", columnDefinition = "TEXT")
    private String descriptionAr;

    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Builder.Default
    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    private Set<Question> questions = new HashSet<>();
}
