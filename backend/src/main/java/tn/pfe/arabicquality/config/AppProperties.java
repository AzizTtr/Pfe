package tn.pfe.arabicquality.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuration applicative — bindée sur le préfixe "app" dans application.yml
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Cors cors = new Cors();
    private Storage storage = new Storage();
    private Keycloak keycloak = new Keycloak();
    private Scoring scoring = new Scoring();
    private Notifications notifications = new Notifications();

    @Data
    public static class Cors {
        private List<String> allowedOrigins;
    }

    @Data
    public static class Storage {
        private String type = "local";
        private Local local = new Local();
        private int maxFileSizeMb = 10;
        private List<String> allowedMimeTypes;

        @Data
        public static class Local {
            private String basePath = "./uploads";
        }
    }

    @Data
    public static class Keycloak {
        private String serverUrl;
        private String realm;
        private Admin admin = new Admin();
        private String frontendClientId;

        @Data
        public static class Admin {
            private String clientId;
            private String clientSecret;
            private String username;
            private String password;
        }
    }

    @Data
    public static class Scoring {
        private boolean autoCalculateOnFinalApproval = true;
    }

    @Data
    public static class Notifications {
        private boolean enabled = true;
        private boolean sendEmail = true;
    }
}
