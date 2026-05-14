package tn.pfe.arabicquality.entities.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.pfe.arabicquality.entities.domain.RegistrationRequest;

@Repository
public interface RegistrationRequestRepository extends JpaRepository<RegistrationRequest, Long> {
    boolean existsByEmailAndStatus(String email, RegistrationRequest.Status status);
    long countByStatus(RegistrationRequest.Status status);
    Page<RegistrationRequest> findByStatus(RegistrationRequest.Status status, Pageable pageable);
    Page<RegistrationRequest> findByStatusOrderByCreatedAtDesc(RegistrationRequest.Status status, Pageable pageable);
}
