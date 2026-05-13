package tn.pfe.arabicquality.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.pfe.arabicquality.catalog.domain.EvaluationCategory;

import java.util.List;

public interface EvaluationCategoryRepository extends JpaRepository<EvaluationCategory, Long> {
    boolean existsByCodeIgnoreCase(String code);
    List<EvaluationCategory> findAllByOrderByDisplayOrderAscNameEnAsc();
}
