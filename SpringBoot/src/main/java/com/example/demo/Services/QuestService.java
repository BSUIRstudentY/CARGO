package com.example.demo.Services;

import com.example.demo.Entities.*;
import com.example.demo.POJO.QuestEvent;
import com.example.demo.Repositories.QuestProgressRepository;
import com.example.demo.Repositories.QuestRepository;
import com.example.demo.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class QuestService {
    private final QuestRepository questRepo;
    private final QuestProgressRepository progressRepo;
    @Autowired
    private UserRepository userRepository;

    public QuestService(QuestRepository questRepo, QuestProgressRepository progressRepo) {
        this.questRepo = questRepo;
        this.progressRepo = progressRepo;
    }

    @KafkaListener(topics = "quest", groupId = "notification-group")
    public void handleEvent(QuestEvent questEvent) {
        User user = userRepository.findByEmail(questEvent.getUserEmail()).get();
        List<Quest> quests = questRepo.findByQuestConditionType(questEvent.getQuestConditionType());

        for (Quest quest : quests) {
            QuestProgress progress = progressRepo.findByUserAndQuestId(user, quest.getId())
                    .orElse(new QuestProgress(user, quest, 0, false, null));

            if (!progress.isCompleted()) {
                progress.setCurrentValue(progress.getCurrentValue() + 1);

                if (progress.getCurrentValue() >= quest.getTargetValue()) {
                    progress.setCompleted(true);
                    progress.setCompletedAt(LocalDateTime.now());
                    if (quest.getRewardType().equals(RewardType.PERMANENT)) {
                        user.addDiscountPercent(quest.getReward());
                    } else {
                        user.addTemporaryDiscountPercent(quest.getReward());
                    }
                    userRepository.save(user);
                }

                progressRepo.save(progress);
            }
        }
    }

    public void createQuest(Quest quest) {
        questRepo.save(quest);
    }

    public List<Quest> getAllQuests() {
        return questRepo.findAll();
    }
}