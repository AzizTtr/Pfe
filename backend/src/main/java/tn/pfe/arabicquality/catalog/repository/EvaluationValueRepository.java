package tn.pfe.arabicquality.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.pfe.arabicquality.catalog.domain.EvaluationValue;

import java.util.List;
import java.util.Optional;

public interface EvaluationValueRepository extends JpaRepository<EvaluationValue, Long> {
    boolean existsByCodeIgnoreCase(String code);
    Optional<EvaluationValue> findByCodeIgnoreCase(String code);
    List<EvaluationValue> findAllByOrderByDisplayOrderAscCodeAsc();
}
