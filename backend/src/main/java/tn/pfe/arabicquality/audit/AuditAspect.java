package tn.pfe.arabicquality.audit;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;

/**
 * Intercepte les méthodes annotées {@link Audit} et écrit une ligne
 * dans la table {@code audit_log}.
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditLogRepository auditRepository;

    @Around("@annotation(tn.pfe.arabicquality.audit.Audit)")
    public Object aroundAudit(ProceedingJoinPoint pjp) throws Throwable {
        Method method = ((MethodSignature) pjp.getSignature()).getMethod();
        Audit annotation = method.getAnnotation(Audit.class);

        Object result;
        boolean success = true;
        Throwable error = null;
        try {
            result = pjp.proceed();
            return result;
        } catch (Throwable t) {
            success = false;
            error = t;
            throw t;
        } finally {
            try {
                writeLog(annotation, success, error);
            } catch (Exception e) {
                log.warn("Failed to write audit log : {}", e.getMessage());
            }
        }
    }

    private void writeLog(Audit annotation, boolean success, Throwable error) {
        var ctx = SecurityContextHolder.getContext().getAuthentication();
        Long userId = null;
        String userEmail = null;
        if (ctx instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();
            userEmail = jwt.getClaimAsString("email");
        }

        HttpServletRequest req = currentRequest();
        String ip = req == null ? null : extractIp(req);
        String ua = req == null ? null : req.getHeader("User-Agent");

        AuditLog entry = AuditLog.builder()
                .userId(userId)
                .userEmail(userEmail)
                .actionType(annotation.action())
                .entityType(annotation.entity().isBlank() ? null : annotation.entity())
                .description(annotation.description().isBlank()
                        ? (success ? "OK" : "FAILED: " + error.getMessage())
                        : annotation.description())
                .success(success)
                .ipAddress(ip)
                .userAgent(ua)
                .build();
        auditRepository.save(entry);
    }

    private HttpServletRequest currentRequest() {
        try {
            var attrs = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            return attrs.getRequest();
        } catch (Exception ignored) {
            return null;
        }
    }

    private String extractIp(HttpServletRequest req) {
        String fwd = req.getHeader("X-Forwarded-For");
        if (fwd != null && !fwd.isBlank()) return fwd.split(",")[0].trim();
        return req.getRemoteAddr();
    }
}
