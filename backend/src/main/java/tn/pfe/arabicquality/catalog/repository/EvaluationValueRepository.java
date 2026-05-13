package tn.pfe.arabicquality.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.pfe.arabicquality.catalog.domain.EvaluationValue;

import java.util.List;

public interface EvaluationValueRepository extends JpaRepository<EvaluationValue, Long> {
    boolean existsByCodeIgnoreCase(String code);
    List<EvaluationValue> findAllByOrderByDisplayOrderAscCodeAsc();
}
