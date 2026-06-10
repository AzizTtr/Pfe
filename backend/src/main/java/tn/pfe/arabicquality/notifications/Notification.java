package tn.pfe.arabicquality.notifications;

import jakarta.persistence.*;
import lombok.*;
import tn.pfe.arabicquality.users.domain.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "event_type", nullable = false, length = 80)
    private String eventType;

    @Column(name = "title_ar", nullable = false, length = 200)
    private String titleAr;

    @Column(name = "title_en", nullable = false, length = 200)
    private String titleEn;

    @Column(name = "message_ar", nullable = false, columnDefinition = "TEXT")
    private String messageAr;

    @Column(name = "message_en", nullable = false, columnDefinition = "TEXT")
    private String messageEn;

    @Column(name = "related_entity", length = 50)
    private String relatedEntity;

    @Column(name = "related_id")
    private Long relatedId;

    @Column(name = "link_url", length = 500)
    private String linkUrl;

    @Column(name = "is_read", nullable = false)
    private boolean read;

    @Column(name = "sent_via_email", nullable = false)
    private boolean sentViaEmail;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
