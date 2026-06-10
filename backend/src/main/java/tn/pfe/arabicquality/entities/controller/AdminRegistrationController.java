package tn.pfe.arabicquality.entities.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.pfe.arabicquality.entities.domain.RegistrationRequest;
import tn.pfe.arabicquality.entities.dto.RegistrationDtos;
import tn.pfe.arabicquality.entities.service.RegistrationService;

import java.util.Map;
import java.util.NoSuchElementException;

/**
 * Endpoints réservés au PLATFORM_ADMIN pour traiter les demandes d'inscription.
 */
@RestController
@RequestMapping("/admin/registrations")
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
@RequiredArgsConstructor
public class AdminRegistrationController {

    private final RegistrationService registrationService;

    /** Liste paginée — filtrable par statut (?status=PENDING|APPROVED|REJECTED). */
    @GetMapping
    public Page<RegistrationDtos.AdminViewDto> list(
            @RequestParam(required = false) RegistrationRequest.Status status,
            @PageableDefault(size = 20) Pageable pageable) {
        return registrationService.list(status, pageable);
    }

    @GetMapping("/counts")
    public Map<String, Long> counts() {
        return registrationService.counts();
    }

    /** Approuve la demande → crée user Keycloak + EducationalEntity + envoie email. */
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id,
                                     @RequestBody(required = false) RegistrationDtos.ApproveDto cmd) {
        try {
            return ResponseEntity.ok(registrationService.approve(id, cmd));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Rejette la demande avec une raison obligatoire. */
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id,
                                    @Valid @RequestBody RegistrationDtos.RejectDto cmd) {
        try {
            registrationService.reject(id, cmd);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
