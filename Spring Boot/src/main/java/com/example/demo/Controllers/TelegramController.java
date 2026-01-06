package com.example.demo.Controllers;

import com.example.demo.Entities.QuestConditionType;
import com.example.demo.Entities.User;
import com.example.demo.POJO.QuestEvent;
import com.example.demo.Repositories.UserRepository;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import com.example.demo.Services.QuestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/telegram")
public class TelegramController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuestService questService;

    @PostMapping
    public ResponseEntity<String> verifyTelegram(@RequestBody TelegramPOJO telegramPOJO) {
        try {
            if (telegramPOJO == null || telegramPOJO.getReferralCode() == null || telegramPOJO.getUserId() == null) {
                return ResponseEntity.badRequest().body("Invalid request: userId and referralCode are required");
            }

            // Call repository method
            int updated = userRepository.updateTelegramIdAndVerifyByReferralCodeIfEmpty(
                    telegramPOJO.getReferralCode(),
                    telegramPOJO.getUserId()
            );

            if (updated >= 1) {
                // Safely handle Optional
                Optional<User> userOpt = userRepository.findByReferralCode(telegramPOJO.getReferralCode());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    QuestEvent telegramQuest = new QuestEvent(user.getEmail(), QuestConditionType.TELEGRAM);
                    questService.handleEvent(telegramQuest);
                    return ResponseEntity.ok("Success: Telegram ID updated for referral code");
                } else {
                    return ResponseEntity.badRequest().body("User with referral code not found");
                }
            } else {
                return ResponseEntity.badRequest().body("Invalid referral code or Telegram ID already set");
            }
        } catch (Exception e) {
            // Log the error for debugging (in production, use a proper logger)
            e.printStackTrace();
            return ResponseEntity.status(500).body("Server error: " + e.getMessage());
        }
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