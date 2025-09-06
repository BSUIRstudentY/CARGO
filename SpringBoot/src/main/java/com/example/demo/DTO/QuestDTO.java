package com.example.demo.DTO;

import com.example.demo.Entities.QuestConditionType;
import com.example.demo.Entities.RewardType;
import lombok.Data;

@Data
public class QuestDTO {
    private Long id;
    private String name;
    private QuestConditionType questConditionType;
    private RewardType rewardType;
    private int targetValue;
    private float reward;
    private int currentValue;
    private boolean completed;
}