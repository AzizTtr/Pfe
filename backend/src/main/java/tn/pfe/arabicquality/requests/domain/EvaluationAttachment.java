package tn.pfe.arabicquality.requests.domain;

import jakarta.persistence.*;
import lombok.*;
import tn.pfe.arabicquality.catalog.domain.EvaluationCategory;
import tn.pfe.arabicquality.catalog.domain.RequiredDocument;
import tn.pfe.arabicquality.users.domain.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "evaluation_attachments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EvaluationAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false)
    private EvaluationRequest request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private EvaluationCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answer_id")
    private EvaluationAnswer answer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "required_doc_id")
    private RequiredDocument requiredDocument;

    @Column(name = "file_uuid", nullable = false, unique = true, length = 36)
    private String fileUuid;

    @Column(name = "original_name", nullable = false, length = 255)
    private String originalName;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Column(name = "size_bytes", nullable = false)
    private Long sizeBytes;

    @Column(name = "storage_path", nullable = false, length = 500)
    private String storagePath;

    @Column(nullable = false, length = 64)
    private String sha256;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "uploaded_by_user_id", nullable = false)
    private User uploadedBy;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
