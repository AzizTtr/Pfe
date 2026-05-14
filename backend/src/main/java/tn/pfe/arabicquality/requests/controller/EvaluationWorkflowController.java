package tn.pfe.arabicquality.requests.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tn.pfe.arabicquality.requests.dto.RequestDtos;
import tn.pfe.arabicquality.requests.service.EvaluationWorkflowService;

import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/evaluation")
@PreAuthorize("hasAnyRole('EVALUATOR','ADMIN_REVIEWER','FIELD_REVIEWER')")
@RequiredArgsConstructor
public class EvaluationWorkflowController {

    private final EvaluationWorkflowService service;

    @GetMapping("/inbox")
    public ResponseEntity<?> inbox(@AuthenticationPrincipal Jwt jwt,
                                   @RequestParam(required = false) String status) {
        try {
            return ResponseEntity.ok(service.inbox(jwt.getSubject(), status));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/requests/{id}")
    public ResponseEntity<?> detail(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.workflowDetail(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/answers/{id}")
    public ResponseEntity<?> reviewAnswer(@AuthenticationPrincipal Jwt jwt,
                                          @PathVariable Long id,
                                          @Valid @RequestBody RequestDtos.AnswerReviewDto dto) {
        try {
            return ResponseEntity.ok(service.reviewAnswer(jwt.getSubject(), id, dto));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/requests/{id}/decisions")
    public ResponseEntity<?> decide(@AuthenticationPrincipal Jwt jwt,
                                    @PathVariable Long id,
                                    @Valid @RequestBody RequestDtos.DecisionSaveDto dto) {
        try {
            return ResponseEntity.ok(service.decide(jwt.getSubject(), id, dto));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
