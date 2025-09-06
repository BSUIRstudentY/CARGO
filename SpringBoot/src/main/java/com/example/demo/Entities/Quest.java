package com.example.demo.Entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Quest {
    @Id
    @GeneratedValue
    private Long id;

    private String name;
    private QuestConditionType questConditionType; // например, "INVITE"
    private int targetValue;      // например, 5
    private RewardType rewardType;
    private float reward;

    @OneToMany(mappedBy = "quest")
    private List<QuestProgress> questProgresses = new ArrayList<>();

    // Конструктор по умолчанию для Hibernate
    public Quest() {
    }

    // Конструктор для удобства
    public Quest(RewardType rewardType, String name, QuestConditionType questConditionType, int targetValue, float reward) {
        this.rewardType = rewardType;
        this.name = name;
        this.questConditionType = questConditionType;
        this.targetValue = targetValue;
        this.reward = reward;
    }
}