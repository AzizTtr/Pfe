package tn.pfe.arabicquality.notifications;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Service d'envoi d'emails transactionnels.
 *
 *  - Templates Thymeleaf bilingues dans {@code resources/templates/email/}
 *  - Envoi asynchrone (le caller n'attend pas)
 *  - En mode dev : SMTP MailHog (port 1025) — visualiser sur http://localhost:8025
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username:no-reply@arabic-quality.local}")
    private String fromAddress;

    @Value("${app.platform.name:Arabic Quality Platform}")
    private String platformName;

    @Value("${app.platform.url:http://localhost:4200}")
    private String platformUrl;

    @Async
    public void sendWelcome(String to, String managerName, String entityName, String welcomeNote) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("managerName", managerName);
        vars.put("entityName",  entityName);
        vars.put("welcomeNote", welcomeNote);
        vars.put("loginUrl",    platformUrl + "/dashboard");
        vars.put("platformName", platformName);
        send(to, subject("welcome", "تم اعتماد تسجيلكم — Welcome to " + platformName), "welcome", vars);
    }

    @Async
    public void sendRejection(String to, String managerName, String entityName, String reason) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("managerName", managerName);
        vars.put("entityName",  entityName);
        vars.put("reason",      reason);
        vars.put("platformName", platformName);
        send(to, subject("rejection", "اعتذار — Registration not approved"), "rejection", vars);
    }

    @Async
    public void sendInfoRequested(String to, String managerName, String requestNumber, String message, String reviewUrl) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("managerName",   managerName);
        vars.put("requestNumber", requestNumber);
        vars.put("message",       message);
        vars.put("reviewUrl",     reviewUrl);
        vars.put("platformName",  platformName);
        send(to, subject("info-requested", "معلومات إضافية مطلوبة — Additional information requested"),
             "info-requested", vars);
    }

    @Async
    public void sendEvaluationCompleted(String to, String managerName, String requestNumber,
                                        String grade, String percentage, String reportUrl) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("managerName",   managerName);
        vars.put("requestNumber", requestNumber);
        vars.put("grade",         grade);
        vars.put("percentage",    percentage);
        vars.put("reportUrl",     reportUrl);
        vars.put("platformName",  platformName);
        send(to, subject("completed", "تقييمكم النهائي — Your final evaluation is ready"),
             "evaluation-completed", vars);
    }

    // ─────────────────────────────────────────────────────────────────

    private void send(String to, String subject, String template, Map<String, Object> vars) {
        try {
            Context ctx = new Context();
            ctx.setVariables(vars);
            String html = templateEngine.process("email/" + template, ctx);

            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, StandardCharsets.UTF_8.name());
            helper.setFrom(fromAddress, platformName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);

            log.info("Email '{}' sent to {}", template, to);
        } catch (Exception e) {
            log.error("Failed to send email '{}' to {} : {}", template, to, e.getMessage(), e);
        }
    }

    private String subject(String key, String fallback) { return fallback; }
}
