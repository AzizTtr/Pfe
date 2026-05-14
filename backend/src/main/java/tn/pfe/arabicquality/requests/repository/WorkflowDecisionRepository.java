package tn.pfe.arabicquality.requests.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.pfe.arabicquality.requests.domain.RequestAssignment;
import tn.pfe.arabicquality.requests.domain.WorkflowDecision;

import java.util.List;
import java.util.Optional;

public interface WorkflowDecisionRepository extends JpaRepository<WorkflowDecision, Long> {
    List<WorkflowDecision> findByRequestIdOrderByDecidedAtDesc(Long requestId);
    Optional<WorkflowDecision> findByRequestIdAndStage(Long requestId, RequestAssignment.Stage stage);
}
