package tn.pfe.arabicquality.requests.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.pfe.arabicquality.requests.domain.EvaluationAnswer;

import java.util.List;

public interface EvaluationAnswerRepository extends JpaRepository<EvaluationAnswer, Long> {
    List<EvaluationAnswer> findByRequestIdOrderByQuestionDisplayOrderAscIdAsc(Long requestId);
    void deleteByRequestId(Long requestId);
}
