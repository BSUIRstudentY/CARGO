package com.example.demo.Controllers;

import com.example.demo.DTO.QuestDTO;
import com.example.demo.DTO.UserDTO;
import com.example.demo.Entities.Quest;
import com.example.demo.Entities.QuestProgress;
import com.example.demo.Entities.User;
import com.example.demo.Entities.QuestConditionType;
import com.example.demo.POJO.QuestEvent;
import com.example.demo.Repositories.QuestProgressRepository;
import com.example.demo.Repositories.QuestRepository;
import com.example.demo.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/loyalty")
public class LoyaltyController {

    private static final Logger logger = Logger.getLogger(LoyaltyController.class.getName());

    @Autowired
    private UserService userService;

    @Autowired
    private QuestRepository questRepository;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private QuestProgressRepository questProgressRepository;

    // Get current user email from SecurityContextHolder
    private String getCurrentUserEmail() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            logger.info("Retrieved email from SecurityContext: " + email);
            return email;
        } catch (Exception e) {
            logger.severe("Failed to retrieve email from SecurityContext: " + e.getMessage());
            return null;
        }
    }

    // Get current user status (discounts)
    @GetMapping("/user")
    @Transactional
    public ResponseEntity<UserDTO> getUserStatus() {
        String email = getCurrentUserEmail();
        if (email == null) {
            logger.warning("Unauthorized access attempt: No authenticated user");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        User user = userService.getUserByEmail(email);
        if (user == null) {
            logger.warning("User not found for email: " + email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        userService.verifyAndSaveUserDiscount(user);
        logger.info("User status retrieved: " + user.getEmail() + ", temporaryDiscountExpired: " + user.getTemporaryDiscountExpired());

        UserDTO userDTO = new UserDTO();
        userDTO.setEmail(user.getEmail());
        userDTO.setUsername(user.getUsername());
        userDTO.setTotalDiscount(user.getTotalDiscount());
        userDTO.setDiscountPercent(user.getDiscountPercent());
        userDTO.setTemporaryDiscountPercent(user.getTemporaryDiscountPercent());
        userDTO.setTemporaryDiscountExpired(user.getTemporaryDiscountExpired());

        logger.info("Returning UserDTO for email: " + email);
        return ResponseEntity.ok(userDTO);
    }

    // Get list of quests and user progress
    @GetMapping("/quests")
    @Transactional
    public ResponseEntity<List<QuestDTO>> getUserQuests() {
        String email = getCurrentUserEmail();
        if (email == null) {
            logger.warning("Unauthorized access attempt: No authenticated user");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        User user = userService.getUserByEmail(email);
        if (user == null) {
            logger.warning("User not found for email: " + email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        List<Quest> allQuests = questRepository.findAll();
        logger.info("Retrieved " + allQuests.size() + " quests for user: " + email);
        List<QuestProgress> userProgress = questProgressRepository.findByUser(user);

        List<QuestDTO> questDTOs = allQuests.stream().map(quest -> {
            QuestDTO dto = new QuestDTO();
            dto.setId(quest.getId());
            dto.setName(quest.getName());
            dto.setQuestConditionType(quest.getQuestConditionType());
            dto.setRewardType(quest.getRewardType());
            dto.setTargetValue(quest.getTargetValue());
            dto.setReward(quest.getReward());

            QuestProgress progress = userProgress.stream()
                    .filter(p -> p.getQuest().getId().equals(quest.getId()))
                    .findFirst()
                    .orElseGet(() -> {
                        QuestProgress newProgress = new QuestProgress(user, quest, 0, false, null);
                        questProgressRepository.save(newProgress);
                        logger.info("Created new QuestProgress for quest ID: " + quest.getId() + ", user: " + email);
                        return newProgress;
                    });

            dto.setCurrentValue(progress.getCurrentValue());
            dto.setCompleted(progress.isCompleted());

            return dto;
        }).collect(Collectors.toList());

        logger.info("Returning " + questDTOs.size() + " QuestDTOs for user: " + email);
        return ResponseEntity.ok(questDTOs);
    }

    // Activate referral code
    @PostMapping("/activate-referral")
    @Transactional
    public ResponseEntity<String> activateReferral(@RequestParam String referralCode) {
        String email = getCurrentUserEmail();
        if (email == null) {
            logger.warning("Unauthorized access attempt: No authenticated user");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        User user = userService.getUserByEmail(email);
        if (user == null) {
            logger.warning("User not found for email: " + email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found: " + email);
        }

        if (user.getReferredBy() != null) {
            logger.warning("Referral already activated for user: " + email);
            return ResponseEntity.badRequest().body("Referral already activated for this user");
        }

        User referrer = userService.getUserByReferralCode(referralCode);
        if (referrer == null) {
            logger.warning("Invalid referral code: " + referralCode);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid referral code: " + referralCode);
        }

        user.setReferredBy(referrer);
        referrer.getReferrals().add(user);
        userService.saveUser(user);
        userService.saveUser(referrer);
        QuestEvent questEvent = new QuestEvent(referrer.getEmail(), QuestConditionType.INVITE);
        kafkaTemplate.send("quest", questEvent.getUserEmail(), questEvent);
        logger.info("Referral activated for user: " + email + ", referrer: " + referrer.getEmail());

        return ResponseEntity.ok("Referral activated successfully");
    }
}