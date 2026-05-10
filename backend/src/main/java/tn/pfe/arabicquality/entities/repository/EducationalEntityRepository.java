package tn.pfe.arabicquality.entities.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.pfe.arabicquality.entities.domain.EducationalEntity;

import java.util.Optional;

@Repository
public interface EducationalEntityRepository extends JpaRepository<EducationalEntity, Long> {
    Optional<EducationalEntity> findByManagerId(Long managerId);
    boolean existsByManagerId(Long managerId);
}
