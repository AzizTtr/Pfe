package tn.pfe.arabicquality.catalog.domain;

import jakarta.persistence.*;
import lombok.*;
import tn.pfe.arabicquality.common.BaseEntity;

import java.math.BigDecimal;

/**
 * Valeurs d'évaluation A/B/C/D avec leur score numérique.
 * Feature 18 — Admin Panel : éditable.
 */
@Entity
@Table(name = "evaluation_values")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EvaluationValue extends BaseEntity {

    @Column(nullable = false, unique = true, length = 10)
    private String code;       // A, B, C, D

    @Column(name = "label_ar", nullable = false, length = 100)
    private String labelAr;

    @Column(name = "label_en", nullable = false, length = 100)
    private String labelEn;

    @Column(name = "numeric_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal numericScore;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
