package tn.pfe.arabicquality.requests.domain;

import jakarta.persistence.*;
import lombok.*;
import tn.pfe.arabicquality.catalog.domain.EvaluationValue;
import tn.pfe.arabicquality.catalog.domain.Question;
import tn.pfe.arabicquality.common.BaseEntity;
import tn.pfe.arabicquality.users.domain.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "evaluation_answers")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EvaluationAnswer extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false)
    private EvaluationRequest request;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initial_value_id")
    private EvaluationValue initialValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "final_value_id")
    private EvaluationValue finalValue;

    @Column(name = "answer_text", columnDefinition = "TEXT")
    private String answerText;

    @Column(name = "evaluator_note", columnDefinition = "TEXT")
    private String evaluatorNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "edited_by_evaluator_id")
    private User editedByEvaluator;

    @Column(name = "edited_at")
    private LocalDateTime editedAt;
}
