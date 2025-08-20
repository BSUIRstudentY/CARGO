package com.example.demo.Entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private byte rating; // Изменено на byte (диапазон 1-5)
    private String text;
    private LocalDateTime createdAt; // Добавлено поле даты создания

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}