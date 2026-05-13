package tn.pfe.arabicquality.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.pfe.arabicquality.catalog.domain.Question;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByCategoryIdOrderByDisplayOrderAscIdAsc(Long categoryId);
    List<Question> findAllByOrderByDisplayOrderAscIdAsc();
}
