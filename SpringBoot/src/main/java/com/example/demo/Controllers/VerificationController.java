package com.example.demo.Controllers;




import com.example.demo.Entities.User;
import com.example.demo.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/verification")
public class VerificationController {

    private static final Logger logger = Logger.getLogger(VerificationController.class.getName());
    private final Map<String, String> verificationCodes = new HashMap<>(); // Simulated storage for codes

    @Autowired
    private UserService userService;

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

    private String generateVerificationCode() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(1000000));
    }

    @PostMapping("/request-email")
    @Transactional
    public ResponseEntity<String> requestEmailVerification() {
        String email = getCurrentUserEmail();
        if (email == null) {
            logger.warning("Unauthorized access attempt: No authenticated user");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        User user = userService.getUserByEmail(email);
        if (user == null) {
            logger.warning("User not found for email: " + email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        if (user.getEmailVerified()) {
            logger.warning("Email already verified for user: " + email);
            return ResponseEntity.badRequest().body("Email already verified");
        }

        String code = generateVerificationCode();
        verificationCodes.put(email, code);
        logger.info("Generated email verification code for " + email + ": " + code);
        // Simulate sending email (replace with actual email service)
        System.out.println("Email sent to " + email + " with code: " + code);

        return ResponseEntity.ok("Verification code sent to email");
    }

    @PostMapping("/confirm-email")
    @Transactional
    public ResponseEntity<String> confirmEmailVerification(@RequestParam String code) {
        String email = getCurrentUserEmail();
        if (email == null) {
            logger.warning("Unauthorized access attempt: No authenticated user");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        User user = userService.getUserByEmail(email);
        if (user == null) {
            logger.warning("User not found for email: " + email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        String storedCode = verificationCodes.get(email);
        if (storedCode == null || !storedCode.equals(code)) {
            logger.warning("Invalid verification code for email: " + email);
            return ResponseEntity.badRequest().body("Invalid verification code");
        }

        user.setEmailVerified(true);
        userService.saveUser(user);
        verificationCodes.remove(email);
        logger.info("Email verified for user: " + email);

        return ResponseEntity.ok("Email verified successfully");
    }

    @PostMapping("/request-phone")
    @Transactional
    public ResponseEntity<String> requestPhoneVerification() {
        String email = getCurrentUserEmail();
        if (email == null) {
            logger.warning("Unauthorized access attempt: No authenticated user");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        User user = userService.getUserByEmail(email);
        if (user == null) {
            logger.warning("User not found for email: " + email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        if (user.getPhone() == null || user.getPhone().isEmpty()) {
            logger.warning("No phone number provided for user: " + email);
            return ResponseEntity.badRequest().body("Phone number is required");
        }

        if (user.getPhoneVerified()) {
            logger.warning("Phone already verified for user: " + email);
            return ResponseEntity.badRequest().body("Phone already verified");
        }

        String code = generateVerificationCode();
        verificationCodes.put(email + ":phone", code);
        logger.info("Generated phone verification code for " + email + ": " + code);
        // Simulate sending SMS (replace with actual SMS service)
        System.out.println("SMS sent to " + user.getPhone() + " with code: " + code);

        return ResponseEntity.ok("Verification code sent to phone");
    }

    @PostMapping("/confirm-phone")
    @Transactional
    public ResponseEntity<String> confirmPhoneVerification(@RequestParam String code) {
        String email = getCurrentUserEmail();
        if (email == null) {
            logger.warning("Unauthorized access attempt: No authenticated user");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        User user = userService.getUserByEmail(email);
        if (user == null) {
            logger.warning("User not found for email: " + email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        String storedCode = verificationCodes.get(email + ":phone");
        if (storedCode == null || !storedCode.equals(code)) {
            logger.warning("Invalid verification code for phone: " + email);
            return ResponseEntity.badRequest().body("Invalid verification code");
        }

        user.setPhoneVerified(true);
        userService.saveUser(user);
        verificationCodes.remove(email + ":phone");
        logger.info("Phone verified for user: " + email);

        return ResponseEntity.ok("Phone verified successfully");
    }
}