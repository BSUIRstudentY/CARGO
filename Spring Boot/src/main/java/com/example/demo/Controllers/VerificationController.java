package com.example.demo.Controllers;

import com.example.demo.Entities.User;
import com.example.demo.Services.GmailSenderService;
import com.example.demo.Services.UserService;
import com.example.demo.Services.VerificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/verification")
public class VerificationController {

    private static final Logger logger = LoggerFactory.getLogger(VerificationController.class);

    @Autowired
    private VerificationService verificationService;

    @Autowired
    private UserService userService;

    @Autowired
    private GmailSenderService gmailSenderService;

    public static class EmailRequest {
        private String email;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    @PostMapping("/request-email")
    public ResponseEntity<String> requestEmailVerification(@RequestBody EmailRequest request, HttpServletRequest httpRequest) {
        String email = request.getEmail();
        try {
            logger.info("Authorization header: {}", httpRequest.getHeader("Authorization"));
            logger.info("Received request to send verification code to email: {}", email);
            if (email == null || email.isEmpty()) {
                logger.warn("Email parameter is missing or empty");
                return ResponseEntity.badRequest().body("Email обязателен");
            }
            Optional<User> userOptional = userService.findByEmail(email);
            if (userOptional.isEmpty()) {
                logger.warn("User with email {} not found", email);
                return ResponseEntity.badRequest().body("Пользователь с таким email не найден");
            }
            User user = userOptional.get();
            if (user.getEmailVerified()) {
                logger.info("Email {} is already verified", email);
                return ResponseEntity.badRequest().body("Email уже верифицирован");
            }
            String code = verificationService.generateVerificationCode(email);
            logger.info("Generated verification code for email {}: {}", email, code);
            gmailSenderService.sendVerificationCode(email, code);
            logger.info("Verification code sent successfully to {}", email);
            return ResponseEntity.ok("Код верификации отправлен на email");
        } catch (MessagingException e) {
            logger.error("Failed to send verification email to {}: {}", email, e.getMessage(), e);
            return ResponseEntity.status(500).body("Ошибка отправки email: " + e.getMessage());
        } catch (IllegalStateException e) {
            logger.warn("Rate limit exceeded for email {}: {}", email, e.getMessage());
            return ResponseEntity.status(429).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during email verification request for {}: {}", email, e.getMessage(), e);
            return ResponseEntity.status(500).body("Ошибка запроса верификации email: " + e.getMessage());
        }
    }

    @PostMapping("/confirm-email")
    public ResponseEntity<String> confirmEmailVerification(@RequestParam String code, HttpServletRequest httpRequest) {
        try {
            logger.info("Authorization header for confirm-email: {}", httpRequest.getHeader("Authorization"));
            logger.info("Received verification code confirmation: {}", code);
            String email = verificationService.verifyCode(code);
            if (email == null) {
                logger.warn("Invalid or expired verification code: {}", code);
                return ResponseEntity.badRequest().body("Неверный или истекший код верификации");
            }
            Optional<User> userOptional = userService.findByEmail(email);
            if (userOptional.isEmpty()) {
                logger.warn("User with email {} not found for code {}", email, code);
                return ResponseEntity.badRequest().body("Пользователь с таким email не найден");
            }
            User user = userOptional.get();
            user.setEmailVerified(true);
            userService.save(user);
            verificationService.removeCode(code);
            logger.info("Email {} successfully verified", email);
            return ResponseEntity.ok("Email успешно верифицирован");
        } catch (Exception e) {
            logger.error("Error confirming email verification for code {}: {}", code, e.getMessage(), e);
            return ResponseEntity.status(500).body("Ошибка подтверждения email: " + e.getMessage());
        }
    }

    @PostMapping("/request-phone")
    public ResponseEntity<String> requestPhoneVerification(HttpServletRequest httpRequest) {
        logger.info("Authorization header for request-phone: {}", httpRequest.getHeader("Authorization"));
        // Implement phone verification logic here (e.g., SMS service integration)
        return ResponseEntity.ok("Код верификации отправлен на телефон");
    }

    @PostMapping("/confirm-phone")
    public ResponseEntity<String> confirmPhoneVerification(@RequestParam String code, HttpServletRequest httpRequest) {
        logger.info("Authorization header for confirm-phone: {}", httpRequest.getHeader("Authorization"));
        // Implement phone verification confirmation logic here
        return ResponseEntity.ok("Телефон успешно верифицирован");
    }
}