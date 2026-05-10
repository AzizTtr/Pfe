package tn.pfe.arabicquality.users.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.pfe.arabicquality.users.dto.UserDtos;
import tn.pfe.arabicquality.users.service.UserManagementService;

import java.util.Map;
import java.util.NoSuchElementException;

/**
 * Endpoints admin pour la gestion des utilisateurs (Feature 15).
 */
@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserManagementService service;

    @GetMapping
    public Page<UserDtos.AdminViewDto> list(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return service.list(role, search, pageable);
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody UserDtos.CreateDto dto) {
        try {
            return ResponseEntity.ok(service.create(dto));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @Valid @RequestBody UserDtos.UpdateDto dto) {
        try {
            return ResponseEntity.ok(service.update(id, dto));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable Long id) {
        try {
            service.setActive(id, false);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reactivate")
    public ResponseEntity<?> reactivate(@PathVariable Long id) {
        try {
            service.setActive(id, true);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}
