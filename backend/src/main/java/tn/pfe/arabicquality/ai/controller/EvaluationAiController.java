package tn.pfe.arabicquality.ai.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.pfe.arabicquality.ai.service.AiAssistantService;

import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/evaluation")
@PreAuthorize("hasAnyRole('EVALUATOR','ADMIN_REVIEWER','FIELD_REVIEWER')")
@RequiredArgsConstructor
public class EvaluationAiController {

    private final AiAssistantService aiAssistantService;

    @GetMapping("/requests/{id}/ai-assistant")
    public ResponseEntity<?> aiAssistant(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(aiAssistantService.evaluationAssistant(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}
