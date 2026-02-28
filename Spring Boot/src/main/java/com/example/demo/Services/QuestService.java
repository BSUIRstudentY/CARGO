package com.example.demo.Services;

import com.example.demo.Entities.*;
import com.example.demo.POJO.QuestEvent;
import com.example.demo.Repositories.QuestProgressRepository;
import com.example.demo.Repositories.QuestRepository;
import com.example.demo.Repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class QuestService {
    private static final Logger log = LoggerFactory.getLogger(QuestService.class);

    private final QuestRepository questRepo;
    private final QuestProgressRepository progressRepo;
    @Autowired
    private UserRepository userRepository;

    public QuestService(QuestRepository questRepo, QuestProgressRepository progressRepo) {
        this.questRepo = questRepo;
        this.progressRepo = progressRepo;
    }

    @Async
    public CompletableFuture<Void> handleEventAsync(QuestEvent questEvent) {
        // Небольшая задержка, чтобы SQLite освободил блокировку после коммита основной транзакции
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Прерван sleep перед обработкой квеста");
        }
        handleEvent(questEvent);
        return CompletableFuture.completedFuture(null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleEvent(QuestEvent questEvent) {
        log.info("Начало обработки квеста в новой транзакции: тип={}, email={}", questEvent.getQuestConditionType(), questEvent.getUserEmail());
        
        User user = userRepository.findByEmail(questEvent.getUserEmail()).orElse(null);
        if (user == null) {
            log.warn("Пользователь не найден для обработки квеста: {}", questEvent.getUserEmail());
            return;
        }
        log.info("Пользователь найден: {}", user.getEmail());

        List<Quest> quests = questRepo.findByQuestConditionType(questEvent.getQuestConditionType());
        log.info("Найдено квестов типа {}: {}", questEvent.getQuestConditionType(), quests.size());
        
        if (quests.isEmpty()) {
            log.warn("Квесты типа {} не найдены в базе данных", questEvent.getQuestConditionType());
            return;
        }

        boolean userChanged = false;

        for (Quest quest : quests) {
            log.info("Обработка квеста {} (id={}) для пользователя {}", quest.getName(), quest.getId(), user.getEmail());
            
            QuestProgress progress = progressRepo.findByUserAndQuestId(user, quest.getId())
                    .orElseGet(() -> {
                        log.info("Создание нового QuestProgress для квеста {} пользователя {}", quest.getId(), user.getEmail());
                        QuestProgress newProgress = new QuestProgress(user, quest, 0, false, null);
                        QuestProgress saved = progressRepo.save(newProgress);
                        log.info("QuestProgress создан с id={}", saved.getId());
                        return saved;
                    });

            if (!progress.isCompleted()) {
                if (questEvent.getQuestConditionType() == QuestConditionType.SPENT) {
                    double moneySpent = user.getMoneySpent() != null ? user.getMoneySpent() : 0.0;
                    progress.setCurrentValue((int) Math.floor(moneySpent));
                } else {
                    int oldValue = progress.getCurrentValue();
                    progress.setCurrentValue(progress.getCurrentValue() + 1);
                    log.info("Увеличение прогресса квеста {}: {} -> {}", quest.getId(), oldValue, progress.getCurrentValue());
                }

                QuestProgress savedProgress = progressRepo.save(progress);
                log.info("Прогресс квеста {} сохранен, id={}, currentValue={}", quest.getId(), savedProgress.getId(), savedProgress.getCurrentValue());

                if (progress.getCurrentValue() >= quest.getTargetValue()) {
                    log.info("Квест {} выполнен! Текущее значение: {}, цель: {}", quest.getId(), progress.getCurrentValue(), quest.getTargetValue());
                    
                    progress.setCompleted(true);
                    progress.setCompletedAt(LocalDateTime.now());
                    QuestProgress completedProgress = progressRepo.save(progress);
                    log.info("Квест {} отмечен как выполненный, id={}", quest.getId(), completedProgress.getId());

                    if (quest.getRewardType() == RewardType.PERMANENT) {
                        float oldDiscount = user.getDiscountPercent();
                        user.addDiscountPercent(quest.getReward());
                        log.info("Добавлена постоянная скидка: {} -> {}%", oldDiscount, user.getDiscountPercent());
                    } else {
                        float oldDiscount = user.getTemporaryDiscountPercent();
                        user.addTemporaryDiscountPercent(quest.getReward());
                        log.info("Добавлена временная скидка: {} -> {}%", oldDiscount, user.getTemporaryDiscountPercent());
                    }
                    userChanged = true;
                }
            } else {
                log.info("Квест {} уже выполнен", quest.getId());
            }
        }

        if (userChanged) {
            log.info("Сохранение изменений пользователя {}", user.getEmail());
            User savedUser = userRepository.save(user);
            log.info("Изменения пользователя {} сохранены", savedUser.getEmail());
        } else {
            log.info("Изменения пользователя не требуются");
        }
        
        log.info("Обработка квеста завершена для пользователя {}", user.getEmail());
    }

    @Transactional
    public Quest createQuest(Quest quest) {
        return questRepo.save(quest);
    }

    public List<Quest> getAllQuests() {
        return questRepo.findAll();
    }
}
