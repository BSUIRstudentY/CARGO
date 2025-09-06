package com.example.demo.Controllers;

import com.example.demo.Entities.Notification;
import com.example.demo.Entities.User;
import com.example.demo.Repositories.NotificationRepository;
import com.example.demo.Repositories.UserRepository;
import com.example.demo.Services.NotificationService;
import jakarta.persistence.criteria.Predicate;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
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

    // DTO for general notification creation
    @Data
    public static class NotificationDTO {
        private Long id;
        private String userEmail;
        private String message;
        private LocalDateTime timestamp;
        private boolean isRead;
        private Long relatedId;
        private String category;
    }

    // POST: Send order status change notification
    @PostMapping("/order-status")
    public ResponseEntity<NotificationDTO> sendOrderStatusNotification(@RequestBody OrderStatusNotificationDTO dto) {
        User user = userRepository.findByEmail(dto.email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Notification notification = notificationService.sendOrderStatusChangeNotification(user, dto.orderId, dto.newStatus);

        NotificationDTO responseDTO = new NotificationDTO();
        responseDTO.setId(notification.getId());
        responseDTO.setUserEmail(dto.email);
        responseDTO.setMessage(notification.getMessage());
        responseDTO.setTimestamp(notification.getTimestamp());
        responseDTO.setRead(notification.isRead());
        responseDTO.setRelatedId(notification.getRelatedId());
        responseDTO.setCategory(notification.getCategory());

        return ResponseEntity.ok(responseDTO);
    }

    // POST: Send new support message notification
    @PostMapping("/support-message")
    public ResponseEntity<NotificationDTO> sendSupportMessageNotification(@RequestBody SupportMessageNotificationDTO dto) {
        User user = userRepository.findByEmail(dto.email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Notification notification = notificationService.sendNewSupportMessageNotification(user, dto.ticketId, dto.senderName);

        NotificationDTO responseDTO = new NotificationDTO();
        responseDTO.setId(notification.getId());
        responseDTO.setUserEmail(dto.email);
        responseDTO.setMessage(notification.getMessage());
        responseDTO.setTimestamp(notification.getTimestamp());
        responseDTO.setRead(notification.isRead());
        responseDTO.setRelatedId(notification.getRelatedId());
        responseDTO.setCategory(notification.getCategory());

        return ResponseEntity.ok(responseDTO);
    }

    // POST: Send global notification
    @PostMapping("/global")
    public void sendGlobalNotification(@RequestBody GlobalNotificationDTO dto) {
        notificationService.sendGlobalNotification(dto.message, dto.category, dto.relatedId);
    }

    // POST: Create a notification for a specific user
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<NotificationDTO> createNotification(@RequestBody NotificationDTO notificationDTO) {
        User user = userRepository.findByEmail(notificationDTO.getUserEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Пользователь с email " + notificationDTO.getUserEmail() + " не найден"));

        Notification notification = notificationService.sendUserNotification(
                user,
                notificationDTO.getMessage(),
                notificationDTO.getRelatedId(),
                notificationDTO.getCategory()
        );

        NotificationDTO responseDTO = new NotificationDTO();
        responseDTO.setId(notification.getId());
        responseDTO.setUserEmail(notificationDTO.getUserEmail());
        responseDTO.setMessage(notification.getMessage());
        responseDTO.setTimestamp(notification.getTimestamp());
        responseDTO.setRead(notification.isRead());
        responseDTO.setRelatedId(notification.getRelatedId());
        responseDTO.setCategory(notification.getCategory());

        return ResponseEntity.ok(responseDTO);
    }

    // GET: Retrieve notifications for the authenticated user
    @GetMapping
    public Page<Notification> getNotifications(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "all") String filter,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "") String search) {

        System.out.println("getNotifications called with user: " + (user != null ? user.getEmail() : "null")); // Для отладки

        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());

        Specification<Notification> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Фильтрация по пользователю или глобальные уведомления
            Predicate globalPredicate = cb.isNull(root.get("user"));
            if (user != null) {
                Predicate personalPredicate = cb.equal(root.get("user"), user);
                predicates.add(cb.or(personalPredicate, globalPredicate));
            } else {
                predicates.add(globalPredicate);
            }

            if (!filter.equals("all")) {
                String category = mapFilterToCategory(filter);
                if (!category.isEmpty()) {
                    predicates.add(cb.equal(root.get("category"), category));
                }
            }

            if (!status.equals("all")) {
                boolean isRead = status.equals("read");
                predicates.add(cb.equal(root.get("isRead"), isRead));
            }

            if (!search.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("message")), "%" + search.toLowerCase() + "%"));
            }

            System.out.println("Predicates count: " + predicates.size()); // Для отладки

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Notification> result = notificationRepository.findAll(spec, pageable);
        System.out.println("Found notifications count: " + result.getContent().size()); // Для отладки

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