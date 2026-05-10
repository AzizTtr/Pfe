package tn.pfe.arabicquality.config.security;

import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tn.pfe.arabicquality.config.AppProperties;

/**
 * Crée le client Admin Keycloak utilisé pour provisionner les comptes
 * (création d'utilisateurs lors de l'approbation des inscriptions, attribution de rôles, etc.).
 *
 * En dev, on utilise grant-type {@code password} avec le compte super-admin du master realm.
 * En prod, préférer un Service Account dédié (client confidential dans le master realm
 * avec rôles {@code realm-management:manage-users} et {@code view-users}).
 */
@Configuration
public class KeycloakAdminClientConfig {

    private final AppProperties appProperties;

    public KeycloakAdminClientConfig(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    @Bean
    public Keycloak keycloakAdminClient() {
        AppProperties.Keycloak.Admin admin = appProperties.getKeycloak().getAdmin();

        KeycloakBuilder builder = KeycloakBuilder.builder()
                .serverUrl(appProperties.getKeycloak().getServerUrl())
                .realm("master")  // l'admin a son compte dans le realm master
                .clientId(admin.getClientId())
                .grantType(admin.getClientSecret() == null || admin.getClientSecret().isBlank()
                        ? OAuth2Constants.PASSWORD
                        : OAuth2Constants.CLIENT_CREDENTIALS);

        if (admin.getClientSecret() != null && !admin.getClientSecret().isBlank()) {
            builder.clientSecret(admin.getClientSecret());
        } else {
            builder.username(admin.getUsername())
                   .password(admin.getPassword());
        }

        return builder.build();
    }
}
