package tn.pfe.arabicquality.ai.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.pfe.arabicquality.ai.service.AiAssistantService;

import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/requests")
@PreAuthorize("hasRole('ENTITY_MANAGER')")
@RequiredArgsConstructor
public class EntityAiController {

    private final AiAssistantService aiAssistantService;

    @GetMapping("/{id}/ai-report")
    public ResponseEntity<?> aiReport(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id, @RequestParam(required = false) String lang) {
        try {
            return ResponseEntity.ok(aiAssistantService.reportForOwner(jwt.getSubject(), id, lang));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}
