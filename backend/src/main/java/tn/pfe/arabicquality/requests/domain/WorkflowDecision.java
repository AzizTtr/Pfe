package tn.pfe.arabicquality.requests.domain;

import jakarta.persistence.*;
import lombok.*;
import tn.pfe.arabicquality.users.domain.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_decisions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class WorkflowDecision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false)
    private EvaluationRequest request;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RequestAssignment.Stage stage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Decision decision;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "decided_by_user_id", nullable = false)
    private User decidedBy;

    @Column(name = "decided_at", nullable = false)
    @Builder.Default
    private LocalDateTime decidedAt = LocalDateTime.now();

    public enum Decision {
        APPROVED,
        REJECTED,
        REQUEST_INFO
    }
}
