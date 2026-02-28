package com.example.demo.Controllers;

import com.example.demo.Entities.QuestConditionType;
import com.example.demo.Entities.User;
import com.example.demo.POJO.QuestEvent;
import com.example.demo.Repositories.QuestProgressRepository;
import com.example.demo.Repositories.QuestRepository;
import com.example.demo.Repositories.UserRepository;
import com.example.demo.Services.QuestService;
import com.example.demo.Services.VerificationService;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/telegram")
public class TelegramController {
    private static final Logger log = LoggerFactory.getLogger(TelegramController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuestService questService;

    @Autowired
    private QuestRepository questRepository;

    @Autowired
    private QuestProgressRepository questProgressRepository;

    @Autowired
    private VerificationService verificationService;

    // Основной эндпоинт — привязка по реферал-коду + выполнение квеста
    @PostMapping
    @Transactional
    public ResponseEntity<String> verifyTelegram(@RequestBody TelegramPOJO telegramPOJO) {
        try {
            if (telegramPOJO == null || telegramPOJO.getReferralCode() == null || telegramPOJO.getUserId() == null) {
                return ResponseEntity.badRequest().body("Неверный запрос: требуются userId и referralCode");
            }

            // Проверяем, не используется ли уже этот telegramUserId другим пользователем
            Optional<User> existingByTelegram = userRepository.findByTelegramUserId(telegramPOJO.getUserId());
            if (existingByTelegram.isPresent() && !existingByTelegram.get().getReferralCode().equals(telegramPOJO.getReferralCode())) {
                log.warn("Telegram ID {} уже используется другим аккаунтом", telegramPOJO.getUserId());
                return ResponseEntity.badRequest().body("Telegram ID уже используется другим аккаунтом");
            }

            int updated = userRepository.updateTelegramIdAndVerifyByReferralCodeIfEmpty(
                    telegramPOJO.getReferralCode(),
                    telegramPOJO.getUserId()
            );

            if (updated >= 1) {
                Optional<User> userOpt = userRepository.findByReferralCode(telegramPOJO.getReferralCode());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();


                    QuestEvent telegramQuest = new QuestEvent(user.getEmail(), QuestConditionType.TELEGRAM);
                    // Выполняем обработку квеста после коммита основной транзакции
                    if (TransactionSynchronizationManager.isActualTransactionActive()) {
                        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {
                            @Override
                            public void afterCommit() {
                                log.info("Транзакция привязки завершена, начинаем асинхронную обработку квеста для пользователя {}", user.getEmail());
                                questService.handleEventAsync(telegramQuest)
                                        .thenRun(() -> log.info("Квест успешно обработан для пользователя {}", user.getEmail()))
                                        .exceptionally(ex -> {
                                            log.error("Ошибка при обработке квеста после коммита (не критично): {}", ex.getMessage(), ex);
                                            return null;
                                        });
                            }
                        });
                        log.info("Зарегистрирована обработка квеста после коммита для пользователя {}", user.getEmail());
                    } else {
                        // Если транзакции нет, выполняем асинхронно
                        questService.handleEventAsync(telegramQuest)
                                .thenRun(() -> log.info("Квест успешно обработан для пользователя {}", user.getEmail()))
                                .exceptionally(ex -> {
                                    log.error("Ошибка при обработке квеста (не критично): {}", ex.getMessage(), ex);
                                    return null;
                                });
                    }
                    return ResponseEntity.ok("Аккаунт успешно привязан и квест выполнен");
                } else {
                    return ResponseEntity.badRequest().body("Пользователь с данным реферальным кодом не найден");
                }
            } else {
                return ResponseEntity.badRequest().body("Неверный реферальный код или аккаунт уже привязан");
            }
        } catch (Exception e) {
            log.error("Ошибка при привязке аккаунта: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Ошибка сервера: " + (e.getMessage() != null ? e.getMessage() : "неизвестная ошибка"));
        }
    }

    // Отписка от канала
    @PostMapping("/unsubscribe")
    public ResponseEntity<String> handleUnsubscribe(@RequestBody UnsubscribePOJO unsubscribePOJO) {
        try {
            if (unsubscribePOJO == null || unsubscribePOJO.getUserId() == null) {
                return ResponseEntity.badRequest().body("Неверный запрос: требуется userId");
            }

            Optional<User> userOpt = userRepository.findByTelegramUserId(unsubscribePOJO.getUserId());
            if (userOpt.isEmpty()) {
                return ResponseEntity.ok("Аккаунт не привязан"); // ничего не делаем
            }

            User user = userOpt.get();

            List<com.example.demo.Entities.Quest> telegramQuests = questRepository.findByQuestConditionType(QuestConditionType.TELEGRAM);

            for (com.example.demo.Entities.Quest quest : telegramQuests) {
                Optional<com.example.demo.Entities.QuestProgress> progressOpt =
                        questProgressRepository.findByUserAndQuestId(user, quest.getId());

                if (progressOpt.isPresent() && progressOpt.get().isCompleted()) {
                    com.example.demo.Entities.QuestProgress progress = progressOpt.get();
                    progress.setCompleted(false);
                    progress.setCompletedAt(null);
                    progress.setCurrentValue(0);
                    questProgressRepository.save(progress);

                    if (quest.getRewardType().equals(com.example.demo.Entities.RewardType.PERMANENT)) {
                        float newDiscount = Math.max(0, user.getDiscountPercent() - quest.getReward());
                        user.setDiscountPercent(newDiscount);
                    } else {
                        user.setTemporaryDiscountPercent(0.0f);
                        user.setTemporaryDiscountExpired(null);
                    }
                }
            }

            user.setTelegramVerified(false);
            userRepository.save(user);

            return ResponseEntity.ok("Успешно: квест отменён и скидки удалены");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Ошибка сервера: " + (e.getMessage() != null ? e.getMessage() : "неизвестная ошибка"));
        }
    }

    // Этот эндпоинт больше не нужен (убран временный пользователь)
    @PostMapping("/save-telegram-user")
    public ResponseEntity<String> saveTelegramUser(@RequestBody PhoneVerificationRequest request) {
        return ResponseEntity.ok("OK"); // просто подтверждаем, ничего не создаём
    }

    // Получение статуса (для кнопки "Мой статус")
    @PostMapping("/get-status")
    public ResponseEntity<?> getStatus(@RequestBody PhoneVerificationRequest request) {
        try {
            if (request == null || request.getUserId() == null) {
                return ResponseEntity.badRequest().body("Требуется userId");
            }

            Optional<User> userOpt = userRepository.findByTelegramUserId(request.getUserId());
            if (userOpt.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "subscribed", false,
                        "discount_active", false
                ));
            }

            User user = userOpt.get();

            boolean subscribed = user.getTelegramVerified(); // или отдельная проверка квеста
            boolean discountActive = subscribed; // упрощённо

            Map<String, Boolean> status = new HashMap<>();
            status.put("subscribed", subscribed);
            status.put("discount_active", discountActive);

            return ResponseEntity.ok(status);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Ошибка сервера");
        }
    }


    // Webhook-прокси (если используется)
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String updateJson) {
        // ... (оставляем как было)
        return ResponseEntity.ok("OK");
    }
}

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
class TelegramPOJO {
    private String userId;
    private String referralCode;
}

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
class UnsubscribePOJO {
    private String userId;
}

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
class PhoneVerificationRequest {
    private String userId;
}
