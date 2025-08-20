package com.example.demo.Controllers;

import com.example.demo.Entities.Notification;
import com.example.demo.Entities.User;
import com.example.demo.Repositories.NotificationRepository;
import com.example.demo.Repositories.UserRepository;
import com.example.demo.Services.NotificationService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    // DTO for sending order status notification
    public static class OrderStatusNotificationDTO {
        public String email;
        public Long orderId;
        public String newStatus;
    }

    // DTO for sending support message notification
    public static class SupportMessageNotificationDTO {
        public String email;
        public Long ticketId;
        public String senderName;
    }

    // DTO for sending global notification
    public static class GlobalNotificationDTO {
        public String message;
        public String category;
        public Long relatedId;
    }

    /*// POST: Send order status change notification
    @PostMapping("/order-status")
    public void sendOrderStatusNotification(@RequestBody OrderStatusNotificationDTO dto) {
        User user = userRepository.findByEmail(dto.email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        notificationService.sendOrderStatusChangeNotification(user, dto.orderId, dto.newStatus);
    }*/

    /*// POST: Send new support message notification
    @PostMapping("/support-message")
    public void sendSupportMessageNotification(@RequestBody SupportMessageNotificationDTO dto) {
        User user = userRepository.findByEmail(dto.email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        notificationService.sendNewSupportMessageNotification(user, dto.ticketId, dto.senderName);
    }*/

    // POST: Send global notification
    @PostMapping("/global")
    public void sendGlobalNotification(@RequestBody GlobalNotificationDTO dto) {
        notificationService.sendGlobalNotification(dto.message, dto.category, dto.relatedId);
    }

    @GetMapping
    public Page<Notification> getNotifications(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "all") String filter,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "") String search) {

        System.out.println("getNotifications called with user: " + (user != null ? user.getEmail() : "null")); // Добавлено для отладки

        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());

        Specification<Notification> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Временный фикс для теста: возвращаем все уведомления, игнорируя user. Если заработает, проблема в user-фильтре.
            // Верните оригинал после теста.
            // Predicate globalPredicate = cb.isNull(root.get("user"));
            // if (user != null) {
            //     Predicate personalPredicate = cb.equal(root.get("user"), user);
            //     predicates.add(cb.or(personalPredicate, globalPredicate));
            // } else {
            //     predicates.add(globalPredicate);
            // }

            if (!filter.equals("all")) {
                String category = mapFilterToCategory(filter);
                if (!category.isEmpty()) {
                    predicates.add(cb.equal(root.get("category"), category));
                }
            }

            if (!status.equals("all")) {
                boolean isRead = status.equals("read");
                predicates.add(cb.equal(root.get("read"), isRead));
            }

            if (!search.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("message")), "%" + search.toLowerCase() + "%"));
            }

            System.out.println("Predicates count: " + predicates.size()); // Добавлено для отладки

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Notification> result = notificationRepository.findAll(spec, pageable);
        System.out.println("Found notifications count: " + result.getContent().size()); // Добавлено для отладки: смотрите в серверных логах

        return result;
    }

    // PUT: Toggle read status for a single notification (only personal)
    @PutMapping("/{id}")
    public void toggleReadStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body, @AuthenticationPrincipal User user) {
        boolean isRead = body.get("isRead");

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (notification.getUser() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot update global notifications");
        }

        if (!notification.getUser().equals(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to update this notification");
        }

        notification.setRead(isRead);
        notificationRepository.save(notification);
    }

    // PUT: Mark all personal notifications as read
    @PutMapping("/mark-all-read")
    public void markAllAsRead(@AuthenticationPrincipal User user) {
        List<Notification> notifications = notificationRepository.findByUserAndIsReadFalse(user);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    // DELETE: Clear all read personal notifications
    @DeleteMapping("/clear-read")
    public void clearReadNotifications(@AuthenticationPrincipal User user) {
        List<Notification> notifications = notificationRepository.findByUserAndIsReadTrue(user);
        notificationRepository.deleteAll(notifications);
    }

    private String mapFilterToCategory(String filter) {
        return switch (filter) {
            case "order" -> "ORDER_UPDATE";
            case "support" -> "NEW_MESSAGE";
            case "promotion" -> "PROMOTION";
            default -> "";
        };
    }
}