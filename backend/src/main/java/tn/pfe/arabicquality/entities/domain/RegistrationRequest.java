package tn.pfe.arabicquality.entities.domain;

import jakarta.persistence.*;
import lombok.*;
import tn.pfe.arabicquality.common.BaseEntity;
import tn.pfe.arabicquality.users.domain.User;

import java.time.LocalDateTime;

/**
 * Demande d'inscription d'une nouvelle institution sur la plateforme.
 * Feature 1.
 */
@Entity
@Table(name = "registration_requests")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RegistrationRequest extends BaseEntity {

    @Column(name = "entity_name", nullable = false, length = 200)
    private String entityName;

    @Column(name = "manager_name", nullable = false, length = 150)
    private String managerName;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.PENDING;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_user_id")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    public enum Status { PENDING, APPROVED, REJECTED }
}
