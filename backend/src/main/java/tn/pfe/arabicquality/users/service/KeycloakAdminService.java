package tn.pfe.arabicquality.users.service;

import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.stereotype.Service;
import tn.pfe.arabicquality.config.AppProperties;

import java.util.Collections;
import java.util.List;

/**
 * Wrapper autour du Admin REST API de Keycloak pour le provisioning :
 *  - création d'utilisateur (avec mot de passe temporaire)
 *  - attribution de rôles
 *  - envoi d'email "set up password"
 *  - désactivation / réactivation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KeycloakAdminService {

    private final Keycloak keycloakAdminClient;
    private final AppProperties appProperties;

    private RealmResource realm() {
        return keycloakAdminClient.realm(appProperties.getKeycloak().getRealm());
    }

    /**
     * Crée un user dans Keycloak. Mot de passe temporaire (l'utilisateur devra le changer
     * via l'email envoyé par Keycloak).
     *
     * @return l'UUID Keycloak (sub) à stocker dans users.kc_id
     */
    public String createUser(String email, String firstName, String lastName, String roleCode) {
        UserRepresentation user = new UserRepresentation();
        user.setUsername(email);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEnabled(true);
        user.setEmailVerified(false);
        user.setRequiredActions(List.of("UPDATE_PASSWORD", "VERIFY_EMAIL"));

        Response response = realm().users().create(user);
        if (response.getStatus() != 201) {
            String body = response.readEntity(String.class);
            throw new RuntimeException("Keycloak createUser failed: " + response.getStatus() + " — " + body);
        }
        String userId = extractIdFromLocation(response.getLocation().getPath());
        log.info("Keycloak user created : {} ({})", email, userId);

        // Attribution du rôle
        assignRealmRole(userId, roleCode);

        // Envoi de l'email "Set Password" — on log mais on ne fait pas échouer
        // la création de l'utilisateur si le SMTP de Keycloak n'est pas configuré.
        try {
            realm().users().get(userId).executeActionsEmail(List.of("UPDATE_PASSWORD"));
            log.info("Set-password email triggered for {}", email);
        } catch (Exception e) {
            log.warn("Keycloak could not send 'set-password' email to {} (SMTP misconfigured?): {}",
                    email, e.getMessage());
        }

        return userId;
    }

    public void assignRealmRole(String userId, String roleCode) {
        UserResource userResource = realm().users().get(userId);
        RoleRepresentation roleRep = realm().roles().get(roleCode).toRepresentation();
        userResource.roles().realmLevel().add(Collections.singletonList(roleRep));
    }

    public void setEnabled(String userId, boolean enabled) {
        UserResource userResource = realm().users().get(userId);
        UserRepresentation rep = userResource.toRepresentation();
        rep.setEnabled(enabled);
        userResource.update(rep);
    }

    /**
     * Envoie un email Keycloak qui contient un lien permettant à l'utilisateur
     * de définir un nouveau mot de passe (sans intervention de l'admin).
     */
    public void sendPasswordResetEmail(String userId) {
        realm().users().get(userId).executeActionsEmail(java.util.List.of("UPDATE_PASSWORD"));
        log.info("Password reset email triggered for kcId={}", userId);
    }

    public void resetPassword(String userId, String newPassword, boolean temporary) {
        CredentialRepresentation cred = new CredentialRepresentation();
        cred.setType(CredentialRepresentation.PASSWORD);
        cred.setValue(newPassword);
        cred.setTemporary(temporary);
        realm().users().get(userId).resetPassword(cred);
    }

    private String extractIdFromLocation(String path) {
        return path.substring(path.lastIndexOf('/') + 1);
    }
}
