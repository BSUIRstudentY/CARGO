package com.example.demo.Services;

import com.example.demo.Entities.Notification;
import com.example.demo.Entities.User;
import com.example.demo.POJO.OrderStatusEvent;
import com.example.demo.POJO.SupportMessageEvent;
import com.example.demo.Repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
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

    @KafkaListener(topics = "order-status", groupId = "notification-group")
    public void sendOrderStatusChangeNotification(OrderStatusEvent event) {
        Notification notification = new Notification();
        notification.setUser(event.getOrder().getUser());
        notification.setMessage("Ваш заказ " + event.getOrder().getOrderNumber() + " был подтверждён администрацией");
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);
        notification.setRelatedId(event.getOrder().getId());
        notification.setCategory("ORDER_UPDATE");

        notificationRepository.save(notification);

        messagingTemplate.convertAndSend("/topic/personal/" + event.getOrder().getUser().getEmail(), notification);
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

    @KafkaListener(topics = "support", groupId = "notification-group")
    public void sendNewSupportMessageNotification(SupportMessageEvent event) {
        Notification notification = new Notification();
        notification.setUser(event.getUser());
        notification.setMessage("Новое сообщение в чате поддержки по тикету #" + event.getTicketId() + " от " + event.getSenderName());
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);
        notification.setRelatedId(event.getTicketId());
        notification.setCategory("NEW_MESSAGE");

        notificationRepository.save(notification);

        messagingTemplate.convertAndSend("/topic/personal/" + event.getUser().getEmail(), notification);
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

    @KafkaListener(topics = "global", groupId = "notification-group")
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
}