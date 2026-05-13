package tn.pfe.arabicquality.catalog.domain;

import jakarta.persistence.*;
import lombok.*;

/**
 * Document obligatoire ou optionnel à joindre lors de la soumission d'une demande
 * pour une catégorie donnée (table {@code category_required_documents}).
 *
 * Exemple : pour la catégorie "Curricula", on peut exiger :
 *  - "Sample lesson plan" (mandatory)
 *  - "Curriculum overview document" (mandatory)
 *  - "Teaching methodology brief" (optional)
 */
@Entity
@Table(name = "category_required_documents")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RequiredDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private EvaluationCategory category;

    @Column(name = "label_ar", nullable = false, length = 200)
    private String labelAr;

    @Column(name = "label_en", nullable = false, length = 200)
    private String labelEn;

    @Column(name = "is_mandatory", nullable = false)
    private boolean mandatory = false;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;
}
