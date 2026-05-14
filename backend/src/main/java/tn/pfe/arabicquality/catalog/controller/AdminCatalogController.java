package tn.pfe.arabicquality.catalog.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.pfe.arabicquality.catalog.dto.CatalogDtos;
import tn.pfe.arabicquality.catalog.service.CatalogAdminService;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/admin/catalog")
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
@RequiredArgsConstructor
public class AdminCatalogController {

    private final CatalogAdminService catalogAdminService;

    @GetMapping("/categories")
    public List<CatalogDtos.CategoryDto> categories() {
        return catalogAdminService.categories();
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@Valid @RequestBody CatalogDtos.CategorySaveDto dto) {
        try {
            return ResponseEntity.ok(catalogAdminService.createCategory(dto));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id,
                                            @Valid @RequestBody CatalogDtos.CategorySaveDto dto) {
        try {
            return ResponseEntity.ok(catalogAdminService.updateCategory(id, dto));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/categories/{id}/deactivate")
    public ResponseEntity<?> deactivateCategory(@PathVariable Long id) {
        try {
            catalogAdminService.setCategoryActive(id, false);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/categories/{id}/reactivate")
    public ResponseEntity<?> reactivateCategory(@PathVariable Long id) {
        try {
            catalogAdminService.setCategoryActive(id, true);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/questions")
    public List<CatalogDtos.QuestionDto> questions(@RequestParam(required = false) Long categoryId) {
        return catalogAdminService.questions(categoryId);
    }

    @PostMapping("/questions")
    public ResponseEntity<?> createQuestion(@Valid @RequestBody CatalogDtos.QuestionSaveDto dto) {
        try {
            return ResponseEntity.ok(catalogAdminService.createQuestion(dto));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/questions/{id}")
    public ResponseEntity<?> updateQuestion(@PathVariable Long id,
                                            @Valid @RequestBody CatalogDtos.QuestionSaveDto dto) {
        try {
            return ResponseEntity.ok(catalogAdminService.updateQuestion(id, dto));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/questions/{id}/deactivate")
    public ResponseEntity<?> deactivateQuestion(@PathVariable Long id) {
        try {
            catalogAdminService.setQuestionActive(id, false);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/questions/{id}/reactivate")
    public ResponseEntity<?> reactivateQuestion(@PathVariable Long id) {
        try {
            catalogAdminService.setQuestionActive(id, true);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/values")
    public List<CatalogDtos.ValueDto> values() {
        return catalogAdminService.values();
    }

    @PostMapping("/values")
    public ResponseEntity<?> createValue(@Valid @RequestBody CatalogDtos.ValueSaveDto dto) {
        try {
            return ResponseEntity.ok(catalogAdminService.createValue(dto));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/values/{id}")
    public ResponseEntity<?> updateValue(@PathVariable Long id,
                                         @Valid @RequestBody CatalogDtos.ValueSaveDto dto) {
        try {
            return ResponseEntity.ok(catalogAdminService.updateValue(id, dto));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/values/{id}/deactivate")
    public ResponseEntity<?> deactivateValue(@PathVariable Long id) {
        try {
            catalogAdminService.setValueActive(id, false);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/values/{id}/reactivate")
    public ResponseEntity<?> reactivateValue(@PathVariable Long id) {
        try {
            catalogAdminService.setValueActive(id, true);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  Required documents per category
    // ─────────────────────────────────────────────────────────────────

    @GetMapping("/categories/{categoryId}/required-documents")
    public ResponseEntity<?> listRequiredDocuments(@PathVariable Long categoryId) {
        try {
            return ResponseEntity.ok(catalogAdminService.requiredDocuments(categoryId));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/categories/{categoryId}/required-documents")
    public ResponseEntity<?> createRequiredDocument(@PathVariable Long categoryId,
                                                    @Valid @RequestBody CatalogDtos.RequiredDocumentSaveDto dto) {
        try {
            return ResponseEntity.ok(catalogAdminService.createRequiredDocument(categoryId, dto));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/required-documents/{id}")
    public ResponseEntity<?> updateRequiredDocument(@PathVariable Long id,
                                                    @Valid @RequestBody CatalogDtos.RequiredDocumentSaveDto dto) {
        try {
            return ResponseEntity.ok(catalogAdminService.updateRequiredDocument(id, dto));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/required-documents/{id}")
    public ResponseEntity<?> deleteRequiredDocument(@PathVariable Long id) {
        try {
            catalogAdminService.deleteRequiredDocument(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}
