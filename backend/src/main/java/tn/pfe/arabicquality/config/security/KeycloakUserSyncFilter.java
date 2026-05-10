package tn.pfe.arabicquality.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tn.pfe.arabicquality.users.service.UserSyncService;

import java.io.IOException;

/**
 * Filtre qui, à chaque requête authentifiée, s'assure que le user est présent
 * dans la table locale {@code users} avec le bon kc_id.
 * Création paresseuse au premier accès, mise à jour si email/nom modifiés côté Keycloak.
 */
@Component
@Order(50)
public class KeycloakUserSyncFilter extends OncePerRequestFilter {

    private final UserSyncService userSyncService;

    public KeycloakUserSyncFilter(UserSyncService userSyncService) {
        this.userSyncService = userSyncService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();
            try {
                userSyncService.syncFromJwt(jwt);
            } catch (Exception e) {
                logger.warn("User sync failed: " + e.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/public/")
                || path.startsWith("/api/swagger-ui")
                || path.startsWith("/api/v3/api-docs")
                || path.startsWith("/api/actuator");
    }
}
