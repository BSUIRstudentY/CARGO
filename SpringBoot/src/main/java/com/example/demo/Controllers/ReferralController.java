package com.example.demo.Controllers;



import com.example.demo.DTO.UserDTO;
import com.example.demo.Entities.User;
import com.example.demo.POJO.QuestEvent;
import com.example.demo.Entities.QuestConditionType;
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
@RequestMapping("/api/referrals")
public class ReferralController {

    private static final Logger logger = Logger.getLogger(ReferralController.class.getName());

    @Autowired
    private UserService userService;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

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

    // Get user data (for referral code)
    @GetMapping("/user")
    @Transactional
    public ResponseEntity<UserDTO> getUserReferralData() {
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

        UserDTO userDTO = new UserDTO();
        userDTO.setEmail(user.getEmail());
        userDTO.setUsername(user.getUsername());
        userDTO.setReferralCode(user.getReferralCode() != null ? user.getReferralCode() : "");

        logger.info("Returning UserDTO for email: " + email);
        return ResponseEntity.ok(userDTO);
    }

    // Activate referral code
    @PostMapping("/activate")
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

        if (referrer.getEmail().equals(email)) {
            logger.warning("User attempted to use own referral code: " + email);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cannot use own referral code");
        }

        user.setReferredBy(referrer);
        referrer.getReferrals().add(user);
        referrer.incrementReferralCount();
        userService.saveUser(user);
        userService.saveUser(referrer);
        QuestEvent questEvent = new QuestEvent(referrer.getEmail(), QuestConditionType.INVITE);
        kafkaTemplate.send("quest", questEvent);
        logger.info("Referral activated for user: " + email + ", referrer: " + referrer.getEmail());

        return ResponseEntity.ok("Referral activated successfully");
    }

    // Get list of referred users
    @GetMapping
    @Transactional
    public ResponseEntity<List<ReferralDTO>> getReferrals() {
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

        List<ReferralDTO> referralDTOs = user.getReferrals().stream().map(referral -> {
            ReferralDTO dto = new ReferralDTO();
            dto.setUsername(referral.getUsername());
            dto.setCreatedAt(referral.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());

        logger.info("Returning " + referralDTOs.size() + " referrals for user: " + email);
        return ResponseEntity.ok(referralDTOs);
    }
}

class ReferralDTO {
    private String username;
    private java.time.LocalDateTime createdAt;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public java.time.LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.time.LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}