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
@RequestMapping("/admin/assignments")
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
@RequiredArgsConstructor
public class AdminAssignmentController {

    private final EvaluationWorkflowService service;

    @GetMapping
    public Object assignments() {
        return service.assignments();
    }

    @GetMapping("/requests")
    public Object requests() {
        return service.assignableRequests();
    }

    @GetMapping("/reviewers")
    public Object reviewers(@RequestParam String roleCode) {
        return service.reviewers(roleCode);
    }

    @PostMapping
    public ResponseEntity<?> assign(@AuthenticationPrincipal Jwt jwt,
                                    @Valid @RequestBody RequestDtos.AssignDto dto) {
        try {
            return ResponseEntity.ok(service.assign(jwt.getSubject(), dto));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
