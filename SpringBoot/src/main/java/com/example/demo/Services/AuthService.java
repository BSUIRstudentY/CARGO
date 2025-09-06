package com.example.demo.Services;

import com.example.demo.Entities.QuestConditionType;
import com.example.demo.Entities.User;
import com.example.demo.POJO.QuestEvent;
import com.example.demo.Repositories.UserRepository;
import com.example.demo.jwt.JwtUtil;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;



    public HashMap<String, String> login(String email, String password) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
            String userEmail = user.getEmail() != null ? user.getEmail() : "";
            String userName = user.getUsername() != null ? user.getUsername() : "";
            String role = user.getRole() != null ? user.getRole() : "USER"; // Роль по умолчанию, если не указана
            String token = jwtUtil.generateToken(email, role); // Передаём роль в токен

            HashMap<String, String> map = new HashMap<>();
            map.put("email", userEmail);
            map.put("username", userName);
            map.put("token", token);
            map.put("role", role); // Добавляем роль в ответ
            return map;
        } catch (AuthenticationException e) {
            throw new RuntimeException("Invalid email or password");
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


        try {
            // Save user and referredByUser (if exists) in a single transaction
            userRepository.save(user);
            if (referredByUser != null) {
                userRepository.save(referredByUser);
                QuestEvent questEvent = new QuestEvent(referredByUser.getEmail(), QuestConditionType.INVITE);
                kafkaTemplate.send("quest", questEvent.getUserEmail(), questEvent);
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

}