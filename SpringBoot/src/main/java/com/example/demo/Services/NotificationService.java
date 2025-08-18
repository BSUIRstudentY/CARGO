package com.example.demo.Services;

import com.example.demo.Entities.Notification;
import com.example.demo.Entities.User;
import com.example.demo.Repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Async
    public void sendOrderStatusChangeNotification(User user, Long orderId, String newStatus) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage("Статус вашего заказа #" + orderId + " изменён на: " + newStatus);
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);
        notification.setRelatedId(orderId);
        notification.setCategory("ORDER_UPDATE");

        notificationRepository.save(notification);

        // Изменено: Используем кастомный топик вместо convertAndSendToUser
        messagingTemplate.convertAndSend("/topic/personal/" + user.getEmail(), notification);
    }

    @Async
    public void sendNewSupportMessageNotification(User user, Long ticketId, String senderName) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage("Новое сообщение в чате поддержки по тикету #" + ticketId + " от " + senderName);
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);
        notification.setRelatedId(ticketId);
        notification.setCategory("NEW_MESSAGE");

        notificationRepository.save(notification);

        // Изменено: Используем кастомный топик вместо convertAndSendToUser
        messagingTemplate.convertAndSend("/topic/personal/" + user.getEmail(), notification);
    }

    @Async
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
}