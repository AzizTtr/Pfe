package tn.pfe.arabicquality.requests.domain;

import jakarta.persistence.*;
import lombok.*;
import tn.pfe.arabicquality.users.domain.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "request_assignments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RequestAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false)
    private EvaluationRequest request;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Stage stage;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assigned_user_id", nullable = false)
    private User assignedUser;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assigned_by_user_id", nullable = false)
    private User assignedBy;

    @Column(name = "is_auto", nullable = false)
    @Builder.Default
    private boolean auto = false;

    @Column(name = "assigned_at", nullable = false)
    @Builder.Default
    private LocalDateTime assignedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public enum Stage {
        INITIAL_EVALUATION,
        ADMIN_REVIEW,
        FIELD_REVIEW
    }
}
