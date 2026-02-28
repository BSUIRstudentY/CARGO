package com.example.demo.Services;

import com.example.demo.Entities.QuestConditionType;
import com.example.demo.Entities.User;
import com.example.demo.POJO.QuestEvent;
import com.example.demo.Repositories.UserRepository;
import com.example.demo.jwt.JwtUtil;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuestService questService;

    @Autowired
    private PasswordEncoder passwordEncoder;



    public HashMap<String, String> login(String email, String password) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        logger.warn("Login attempt failed: user not found with email: {}", email);
                        return new BadCredentialsException("Invalid email or password");
                    });

            boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());
            if (!passwordMatches) {
                logger.warn("Login attempt failed: invalid password for email: {}", email);
                throw new BadCredentialsException("Invalid email or password");
            }

            // Security authenticate
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));

            // Generate JWT token
            String token = jwtUtil.generateToken(email, user.getRole());
            logger.info("User logged in successfully: {}", email);

            HashMap<String, String> map = new HashMap<>();
            map.put("email", user.getEmail());
            map.put("username", user.getDisplayUsername()); // Используем реальное имя пользователя
            map.put("token", token);
            map.put("role", user.getRole());
            return map;
        } catch (BadCredentialsException e) {
            // Re-throw BadCredentialsException as-is
            logger.warn("Authentication failed for email: {} - {}", email, e.getMessage());
            throw e;
        } catch (AuthenticationException e) {
            logger.warn("Authentication failed for email: {} - {}", email, e.getMessage());
            throw new BadCredentialsException("Invalid email or password", e);
        } catch (Exception e) {
            logger.error("Unexpected error during login for email: {}", email, e);
            throw new BadCredentialsException("Invalid email or password", e);
        }
    }

    @Transactional
    public String register(String email, String password, String username, String referralCode) {
        // Validate inputs
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }

        // Check if user already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("User with email " + email + " already exists");
        }

        User referredByUser = null;
        if (referralCode != null && !referralCode.trim().isEmpty()) {
            referredByUser = userRepository.findByReferralCode(referralCode)
                    .orElseThrow(() -> new RuntimeException("Invalid referral code: " + referralCode));
            referredByUser.incrementReferralCount();
        }

        // Create new user
        User user = new User();
        user.setEmail(email.trim());
        user.setUsername(username.trim());
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("USER");
        user.setReferredBy(referredByUser);
        user.setTemporaryDiscountExpired(LocalDateTime.now().plusMonths(2));
        user.setDiscountPercent(0.0f);
        user.setTemporaryDiscountPercent(0.0f);
        user.setCreatedAt(LocalDateTime.now());
        user.setReferralCode(UUID.randomUUID().toString());
        user.setMoneySpent(0.0);
        user.setReferralCount(0);
        user.setNotificationsEnabled(true); // По умолчанию уведомления включены


        try {
            // Save user and referredByUser (if exists) in a single transaction
            userRepository.save(user);
            if (referredByUser != null) {
                userRepository.save(referredByUser);
                QuestEvent questEvent = new QuestEvent(referredByUser.getEmail(), QuestConditionType.INVITE);
                questService.handleEvent(questEvent);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to save user to database: " + e.getMessage(), e);
        }


        // Generate and return JWT token
        return jwtUtil.generateToken(email, "USER");
    }

    public boolean existsByReferralCode(String code)
    {

        return userRepository.existsByReferralCode(code);
    }

    @Transactional
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.warn("Password reset failed: user not found with email: {}", email);
                    return new RuntimeException("Пользователь с таким email не найден");
                });

        if (newPassword == null || newPassword.trim().isEmpty() || newPassword.length() < 6) {
            throw new IllegalArgumentException("Пароль должен содержать минимум 6 символов");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        logger.info("Password reset successfully for email: {}", email);
    }

}