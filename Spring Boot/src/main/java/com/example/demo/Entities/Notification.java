package com.example.demo.Entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_timestamp", columnList = "timestamp"),
        @Index(name = "idx_category", columnList = "category")
})
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Кому адресовано (null для глобальных уведомлений)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message; // Текст уведомления

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now(); // Время создания

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false; // Прочитано ли

    // Опционально: ссылка на связанную сущность (например, заказ или тикет)
    private Long relatedId; // ID заказа, тикета и т.д.

    // Опционально: категория для фильтрации (например, "ORDER_UPDATE", "NEW_MESSAGE")
    @Column(length = 50)
    private String category;
}