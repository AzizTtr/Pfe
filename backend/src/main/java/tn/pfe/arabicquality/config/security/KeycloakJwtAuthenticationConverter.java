package tn.pfe.arabicquality.config.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Convertit le JWT Keycloak en {@link JwtAuthenticationToken} avec les bonnes authorities.
 *
 * Keycloak met les rôles dans le claim :
 *  - "realm_access" : { "roles": ["ROLE_ENTITY_MANAGER", ...] }
 *  - "resource_access" : { "<client-id>" : { "roles": [...] } }
 *
 * Spring Security s'attend à des {@code SimpleGrantedAuthority} préfixées par "ROLE_".
 * Les rôles définis dans le realm Keycloak respectent déjà cette convention.
 */
@Component
public class KeycloakJwtAuthenticationConverter
        implements Converter<Jwt, AbstractAuthenticationToken> {

    private static final String CLAIM_REALM_ACCESS = "realm_access";
    private static final String CLAIM_RESOURCE_ACCESS = "resource_access";
    private static final String CLAIM_ROLES = "roles";

    private final JwtGrantedAuthoritiesConverter scopesConverter = new JwtGrantedAuthoritiesConverter();

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = Stream.of(
                scopesConverter.convert(jwt).stream(),
                extractRealmRoles(jwt).stream(),
                extractResourceRoles(jwt).stream()
        ).flatMap(s -> s).collect(Collectors.toSet());

        return new JwtAuthenticationToken(jwt, authorities, jwt.getClaimAsString("preferred_username"));
    }

    @SuppressWarnings("unchecked")
    private Collection<GrantedAuthority> extractRealmRoles(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaim(CLAIM_REALM_ACCESS);
        if (realmAccess == null) return Collections.emptyList();

        List<String> roles = (List<String>) realmAccess.get(CLAIM_ROLES);
        if (roles == null) return Collections.emptyList();

        return roles.stream()
                .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toSet());
    }

    @SuppressWarnings("unchecked")
    private Collection<GrantedAuthority> extractResourceRoles(Jwt jwt) {
        Map<String, Object> resourceAccess = jwt.getClaim(CLAIM_RESOURCE_ACCESS);
        if (resourceAccess == null) return Collections.emptyList();

        return resourceAccess.values().stream()
                .filter(v -> v instanceof Map)
                .map(v -> (Map<String, Object>) v)
                .map(m -> (List<String>) m.get(CLAIM_ROLES))
                .filter(Objects::nonNull)
                .flatMap(List::stream)
                .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toSet());
    }
}
