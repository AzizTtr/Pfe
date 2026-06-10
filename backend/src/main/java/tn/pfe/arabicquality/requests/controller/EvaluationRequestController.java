package tn.pfe.arabicquality.requests.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.pfe.arabicquality.reports.service.RequestReportService;
import tn.pfe.arabicquality.requests.dto.RequestDtos;
import tn.pfe.arabicquality.requests.service.EvaluationRequestService;

import java.io.IOException;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/requests")
@PreAuthorize("hasRole('ENTITY_MANAGER')")
@RequiredArgsConstructor
public class EvaluationRequestController {

    private final EvaluationRequestService service;
    private final RequestReportService requestReportService;

    @GetMapping("/catalog")
    public RequestDtos.CatalogDto catalog() {
        return service.catalog();
    }

    @GetMapping("/mine")
    public ResponseEntity<?> mine(@AuthenticationPrincipal Jwt jwt) {
        try {
            return ResponseEntity.ok(service.mine(jwt.getSubject()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> detail(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.detail(jwt.getSubject(), id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal Jwt jwt,
                                    @Valid @RequestBody RequestDtos.SaveRequestDto dto) {
        try {
            return ResponseEntity.ok(service.create(jwt.getSubject(), dto));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateDraft(@AuthenticationPrincipal Jwt jwt,
                                         @PathVariable Long id,
                                         @Valid @RequestBody RequestDtos.SaveRequestDto dto) {
        try {
            return ResponseEntity.ok(service.updateDraft(jwt.getSubject(), id, dto));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submit(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.submit(jwt.getSubject(), id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<?> upload(@AuthenticationPrincipal Jwt jwt,
                                    @PathVariable Long id,
                                    @RequestParam Long requiredDocumentId,
                                    @RequestPart("file") MultipartFile file) throws IOException {
        try {
            return ResponseEntity.ok(service.upload(jwt.getSubject(), id, requiredDocumentId, file));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/report/pdf")
    public ResponseEntity<?> finalReport(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        try {
            byte[] content = requestReportService.exportForOwner(jwt.getSubject(), id);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            ContentDisposition.attachment().filename("evaluation-report-" + id + ".pdf").build().toString())
                    .body(content);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
