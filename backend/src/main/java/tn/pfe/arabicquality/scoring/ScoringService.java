package tn.pfe.arabicquality.scoring;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

/**
 * Calcul du score final d'une demande d'évaluation.
 *
 * Formule (cf. 01_ARCHITECTURE.md §6) :
 *   score(c)       = Σ poids_de_la_valeur_choisie pour q ∈ catégorie c
 *   max(c)         = nb_questions(c) × score_max
 *   pourcentage(c) = score(c) / max(c) × 100
 *   total          = Σ score(c) / Σ max(c) × 100
 *
 * On classe ensuite via {@code grading_scale}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ScoringService {

    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public ScoreResult calculate(Long requestId) {
        // Score total = sum(numeric_score des final_value | initial_value)
        BigDecimal totalScore = jdbcTemplate.queryForObject("""
            SELECT COALESCE(SUM(ev.numeric_score), 0)
              FROM evaluation_answers ea
              JOIN evaluation_values ev
                ON ev.id = COALESCE(ea.final_value_id, ea.initial_value_id)
             WHERE ea.request_id = ?
            """, BigDecimal.class, requestId);

        // Score maximum = nb_réponses × score_max (généralement 4 = A)
        BigDecimal maxScore = jdbcTemplate.queryForObject("""
            SELECT COUNT(*) * (SELECT MAX(numeric_score) FROM evaluation_values WHERE is_active = TRUE)
              FROM evaluation_answers
             WHERE request_id = ?
            """, BigDecimal.class, requestId);

        if (maxScore == null || maxScore.compareTo(BigDecimal.ZERO) == 0) {
            log.warn("Aucune réponse — score impossible pour request {}", requestId);
            return new ScoreResult(BigDecimal.ZERO, BigDecimal.ZERO, null);
        }

        BigDecimal percentage = totalScore.multiply(new BigDecimal("100"))
                                          .divide(maxScore, 2, RoundingMode.HALF_UP);

        Long gradeId = jdbcTemplate.query("""
            SELECT id FROM grading_scale
             WHERE is_active = TRUE
               AND ? BETWEEN min_percentage AND max_percentage
             LIMIT 1
            """, rs -> rs.next() ? rs.getLong("id") : null, percentage);

        // Persistance dans la demande
        jdbcTemplate.update("""
            UPDATE evaluation_requests
               SET final_score = ?, final_percentage = ?, final_grade_id = ?, is_locked = TRUE
             WHERE id = ?
            """, totalScore, percentage, gradeId, requestId);

        log.info("Score calculé pour request {} : {}/{} ({}%) — gradeId={}",
                requestId, totalScore, maxScore, percentage, gradeId);

        return new ScoreResult(totalScore, percentage, gradeId);
    }

    public record ScoreResult(BigDecimal totalScore, BigDecimal percentage, Long gradeId) {}
}
