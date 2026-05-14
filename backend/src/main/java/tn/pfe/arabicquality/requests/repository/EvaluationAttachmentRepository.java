package tn.pfe.arabicquality.requests.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.pfe.arabicquality.requests.domain.EvaluationAttachment;

import java.util.List;

public interface EvaluationAttachmentRepository extends JpaRepository<EvaluationAttachment, Long> {
    List<EvaluationAttachment> findByRequestIdOrderByCreatedAtDescIdDesc(Long requestId);
    boolean existsByRequestIdAndRequiredDocumentId(Long requestId, Long requiredDocumentId);
}
