package tn.pfe.arabicquality;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Point d'entrée de l'application.
 *
 * Plateforme d'évaluation de la qualité de l'enseignement de l'arabe pour non-arabophones.
 *
 * Stack :
 *  - Spring Boot 3.2 / Java 17
 *  - MySQL 8 + Flyway
 *  - Keycloak (OIDC) pour l'authentification
 *  - Spring Security OAuth2 Resource Server pour la validation JWT
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class ArabicQualityApplication {

    public static void main(String[] args) {
        SpringApplication.run(ArabicQualityApplication.class, args);
    }
}
