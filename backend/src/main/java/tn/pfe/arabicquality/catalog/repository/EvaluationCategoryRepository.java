package tn.pfe.arabicquality.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.pfe.arabicquality.catalog.domain.EvaluationCategory;

import java.util.List;
import java.util.Optional;

public interface EvaluationCategoryRepository extends JpaRepository<EvaluationCategory, Long> {
    boolean existsByCodeIgnoreCase(String code);
    Optional<EvaluationCategory> findByCodeIgnoreCase(String code);
    List<EvaluationCategory> findAllByOrderByDisplayOrderAscNameEnAsc();
}
