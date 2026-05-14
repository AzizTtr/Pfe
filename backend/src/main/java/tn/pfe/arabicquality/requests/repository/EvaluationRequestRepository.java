package tn.pfe.arabicquality.requests.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.pfe.arabicquality.requests.domain.EvaluationRequest;
import tn.pfe.arabicquality.requests.domain.RequestStatus;

import java.util.List;
import java.util.Optional;

public interface EvaluationRequestRepository extends JpaRepository<EvaluationRequest, Long> {
    long countByStatus(RequestStatus status);
    List<EvaluationRequest> findBySubmittedByIdOrderByCreatedAtDesc(Long submittedById);
    List<EvaluationRequest> findAllByOrderByUpdatedAtDesc();
    Optional<EvaluationRequest> findByIdAndSubmittedById(Long id, Long submittedById);
}
