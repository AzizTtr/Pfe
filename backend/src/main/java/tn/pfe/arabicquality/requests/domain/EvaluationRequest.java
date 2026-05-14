package tn.pfe.arabicquality.requests.domain;

import jakarta.persistence.*;
import lombok.*;
import tn.pfe.arabicquality.common.BaseEntity;
import tn.pfe.arabicquality.entities.domain.EducationalEntity;
import tn.pfe.arabicquality.users.domain.User;
import tn.pfe.arabicquality.catalog.domain.EvaluationCategory;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Demande d'évaluation soumise par une institution.
 * Cycle de vie complet : DRAFT → PENDING_REVIEW → ... → COMPLETED
 *
 * Voir 01_ARCHITECTURE.md §5 pour le diagramme d'états.
 */
@Entity
@Table(name = "evaluation_requests")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EvaluationRequest extends BaseEntity {

    @Column(name = "request_number", nullable = false, unique = true, length = 30)
    private String requestNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "entity_id", nullable = false)
    private EducationalEntity entity;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submitted_by_user_id", nullable = false)
    private User submittedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private RequestStatus status = RequestStatus.DRAFT;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "final_score", precision = 6, scale = 2)
    private BigDecimal finalScore;

    @Column(name = "final_percentage", precision = 5, scale = 2)
    private BigDecimal finalPercentage;

    @Column(name = "final_grade_id")
    private Long finalGradeId;

    @Column(name = "is_locked", nullable = false)
    @Builder.Default
    private boolean locked = false;

    @Builder.Default
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "evaluation_request_categories",
            joinColumns = @JoinColumn(name = "request_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<EvaluationCategory> categories = new HashSet<>();
}
