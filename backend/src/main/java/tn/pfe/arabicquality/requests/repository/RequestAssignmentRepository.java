package tn.pfe.arabicquality.requests.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.pfe.arabicquality.requests.domain.RequestAssignment;

import java.util.List;
import java.util.Optional;

public interface RequestAssignmentRepository extends JpaRepository<RequestAssignment, Long> {
    List<RequestAssignment> findByAssignedUserIdAndCompletedAtIsNullOrderByAssignedAtDesc(Long assignedUserId);
    List<RequestAssignment> findByRequestIdOrderByAssignedAtDesc(Long requestId);
    Optional<RequestAssignment> findByRequestIdAndStage(Long requestId, RequestAssignment.Stage stage);
}
