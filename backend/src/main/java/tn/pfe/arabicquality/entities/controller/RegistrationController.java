package tn.pfe.arabicquality.entities.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.pfe.arabicquality.entities.dto.RegistrationDtos;
import tn.pfe.arabicquality.entities.service.RegistrationService;

import java.util.Map;

@RestController
@RequestMapping("/public/registration-requests")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    /** Endpoint public — soumission d'une nouvelle demande d'inscription. */
    @PostMapping
    public ResponseEntity<?> submit(@Valid @RequestBody RegistrationDtos.SubmitDto dto) {
        try {
            Long id = registrationService.submit(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", id));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
