package com.example.demo.Services;

import com.example.demo.Entities.Notification;
import com.example.demo.Entities.User;
import com.example.demo.Repositories.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationService {
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final WebClient webClient;

    @Autowired
    public NotificationService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("http://localhost:8080/api").build();
    }

    public Notification sendOrderStatusChangeNotification(User user, Long orderId, String newStatus) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage("Ваш заказ #" + orderId + " изменил статус на " + newStatus);
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);
        notification.setRelatedId(orderId);
        notification.setCategory("ORDER_UPDATE");

        Notification savedNotification = notificationRepository.save(notification);
        messagingTemplate.convertAndSend("/topic/personal/" + user.getEmail(), savedNotification);
        return savedNotification;
    }

    public Notification sendNewSupportMessageNotification(User user, Long ticketId, String senderName) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage("Новое сообщение в чате поддержки по тикету #" + ticketId + " от " + senderName);
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);
        notification.setRelatedId(ticketId);
        notification.setCategory("NEW_MESSAGE");

        Notification savedNotification = notificationRepository.save(notification);
        messagingTemplate.convertAndSend("/topic/personal/" + user.getEmail(), savedNotification);
        return savedNotification;
    }

    public void sendGlobalNotification(String message, String category, Long relatedId) {
        Notification notification = new Notification();
        notification.setUser(null);
        notification.setMessage(message);
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);
        notification.setRelatedId(relatedId);
        notification.setCategory(category);

        notificationRepository.save(notification);

        messagingTemplate.convertAndSend("/topic/global-notifications", notification);
    }

    public void sendOrderItemStatusChangeNotification(User user, Long orderId, String productName, String refusalReason) {
        String message = String.format("Товар '%s' в заказе #%d не выкуплен. Причина: %s", productName, orderId, refusalReason);
        Map<String, Object> notification = new HashMap<>();
        notification.put("userEmail", user.getEmail());
        notification.put("message", message);
        notification.put("relatedId", orderId);
        notification.put("category", "ORDER_ITEM_UPDATE");

        webClient.post()
                .uri("/notifications")
                .body(Mono.just(notification), Map.class)
                .retrieve()
                .bodyToMono(Void.class)
                .doOnSuccess(response -> logger.debug("Notification sent: {}", message))
                .doOnError(error -> logger.error("Failed to send notification: {}", error.getMessage(), error))
                .subscribe();
    }

    public Notification sendUserNotification(User user, String message, Long relatedId, String category) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);
        notification.setRelatedId(relatedId);
        notification.setCategory(category);

        Notification savedNotification = notificationRepository.save(notification);
        messagingTemplate.convertAndSend("/topic/personal/" + user.getEmail(), savedNotification);
        return savedNotification;
    }

    @Async
    public void sendUserNotificationAsync(User user, String message, Long relatedId, String category) {
        try {
            // Небольшая задержка, чтобы SQLite освободил блокировку после коммита основной транзакции
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.warn("Interrupted sleep before sending notification");
        }
        
        try {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setMessage(message);
            notification.setTimestamp(LocalDateTime.now());
            notification.setRead(false);
            notification.setRelatedId(relatedId);
            notification.setCategory(category);

            Notification savedNotification = notificationRepository.save(notification);
            messagingTemplate.convertAndSend("/topic/personal/" + user.getEmail(), savedNotification);
            logger.debug("Async notification sent to user {}: {}", user.getEmail(), message);
        } catch (Exception e) {
            logger.error("Failed to send async notification to user {}: {}", user.getEmail(), e.getMessage(), e);
        }
    }

}