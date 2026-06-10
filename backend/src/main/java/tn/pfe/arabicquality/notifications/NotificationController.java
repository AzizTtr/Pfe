package tn.pfe.arabicquality.notifications;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tn.pfe.arabicquality.users.domain.User;
import tn.pfe.arabicquality.users.repository.UserRepository;
import tn.pfe.arabicquality.users.service.UserSyncService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final UserSyncService userSyncService;

    @GetMapping
    public Map<String, Object> list(@AuthenticationPrincipal Jwt jwt,
                                    @RequestParam(defaultValue = "false") boolean unreadOnly) {
        User user = currentUser(jwt);
        List<Notification> rows = unreadOnly
                ? notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(user.getId())
                : notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return Map.of(
                "unread", notificationRepository.countByUserIdAndReadFalse(user.getId()),
                "items", rows.stream().map(this::toDto).toList());
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markRead(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        User user = currentUser(jwt);
        return notificationRepository.findById(id)
                .filter(notification -> notification.getUser().getId().equals(user.getId()))
                .map(notification -> {
                    notification.setRead(true);
                    notification.setReadAt(LocalDateTime.now());
                    notificationRepository.save(notification);
                    return ResponseEntity.noContent().build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllRead(@AuthenticationPrincipal Jwt jwt) {
        User user = currentUser(jwt);
        notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(user.getId()).forEach(notification -> {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        });
        return ResponseEntity.noContent().build();
    }

    private User currentUser(Jwt jwt) {
        return userRepository.findByKcId(jwt.getSubject())
                .orElseGet(() -> userSyncService.syncFromJwt(jwt));
    }

    private Map<String, Object> toDto(Notification notification) {
        return Map.of(
                "id", notification.getId(),
                "eventType", notification.getEventType(),
                "titleAr", notification.getTitleAr(),
                "titleEn", notification.getTitleEn(),
                "messageAr", notification.getMessageAr(),
                "messageEn", notification.getMessageEn(),
                "linkUrl", notification.getLinkUrl() == null ? "" : notification.getLinkUrl(),
                "read", notification.isRead(),
                "createdAt", notification.getCreatedAt());
    }
}
