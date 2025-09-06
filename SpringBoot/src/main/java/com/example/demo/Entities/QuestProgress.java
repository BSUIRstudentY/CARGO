package com.example.demo.Entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class QuestProgress {
    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Quest quest;

    private int currentValue;
    private boolean completed;
    private LocalDateTime completedAt;

    // Конструктор по умолчанию для Hibernate
    public QuestProgress() {
    }

    // Конструктор для удобства
    public QuestProgress(User user, Quest quest, int currentValue, boolean completed, LocalDateTime completedAt) {
        this.user = user;
        this.quest = quest;
        this.currentValue = currentValue;
        this.completed = completed;
        this.completedAt = completedAt;
    }
}