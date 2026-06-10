package tn.pfe.arabicquality.audit;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/admin/audit-log")
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
@RequiredArgsConstructor
public class AdminAuditController {

    private final AuditLogRepository repository;

    @GetMapping
    public Page<AuditLog> list(@RequestParam(required = false) String action,
                               @RequestParam(required = false) String user,
                               @RequestParam(required = false) String entity,
                               @RequestParam(required = false) Boolean success,
                               @RequestParam(required = false) LocalDate from,
                               @RequestParam(required = false) LocalDate to,
                               @PageableDefault(size = 50) Pageable pageable) {
        return repository.findAll(spec(action, user, entity, success, from, to), pageable);
    }

    private Specification<AuditLog> spec(String action, String user, String entity, Boolean success,
                                         LocalDate from, LocalDate to) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (action != null && !action.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("actionType")), "%" + action.toLowerCase() + "%"));
            }
            if (user != null && !user.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("userEmail")), "%" + user.toLowerCase() + "%"));
            }
            if (entity != null && !entity.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("entityType")), "%" + entity.toLowerCase() + "%"));
            }
            if (success != null) {
                predicates.add(cb.equal(root.get("success"), success));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from.atStartOfDay()));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to.atTime(LocalTime.MAX)));
            }
            query.orderBy(cb.desc(root.get("createdAt")));
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
