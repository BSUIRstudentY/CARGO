package com.example.demo.Controllers;

import com.example.demo.DTO.UserDTO;
import com.example.demo.Entities.User;
import com.example.demo.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String getCurrentUserEmail() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return null;
        }
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> getCurrentUser() {
        String userEmail = getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(403).body(null);
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        user.verifyDiscount();

        UserDTO userDTO = new UserDTO();
        userDTO.setEmail(user.getEmail());
        userDTO.setUsername(user.getUsername());
        userDTO.setPhone(user.getPhone());
        userDTO.setCompany(user.getCompany());
        userDTO.setRole(user.getRole());
        userDTO.setReferralCode(user.getReferralCode());
        userDTO.setReferralCount(user.getReferralCount());
        userDTO.setDiscountPercent(user.getDiscountPercent());
        userDTO.setTemporaryDiscountPercent(user.getTemporaryDiscountPercent());
        userDTO.setTemporaryDiscountExpired(user.getTemporaryDiscountExpired());
        userDTO.setTotalDiscount(user.getTotalDiscount());
        userDTO.setBalance(user.getBalance());
        userDTO.setMoneySpent(user.getMoneySpent());
        userDTO.setNotificationsEnabled(user.getNotificationsEnabled());
        userDTO.setTwoFactorEnabled(user.getTwoFactorEnabled());
        userDTO.setAvatarUrl(user.getAvatarUrl());
        userDTO.setEmailVerified(user.getEmailVerified());
        userDTO.setPhoneVerified(user.getPhoneVerified());

        return ResponseEntity.ok(userDTO);
    }

    // Получение профиля текущего пользователя
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getProfile() {
        String email = getCurrentUserEmail();
        if (email == null) {
            return ResponseEntity.status(401).body("Пользователь не аутентифицирован");
        }

        Optional<User> user = userRepository.findByEmail(email);
        return user.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Обновление профиля текущего пользователя
    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> updates) {
        String email = getCurrentUserEmail();
        if (email == null) {
            return ResponseEntity.status(401).body("Пользователь не аутентифицирован");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        if (updates.containsKey("username")) {
            user.setUsername((String) updates.get("username"));
        }
        if (updates.containsKey("email")) {
            user.setEmail((String) updates.get("email"));
        }
        if (updates.containsKey("phone")) {
            user.setPhone((String) updates.get("phone"));
        }
        if (updates.containsKey("company")) {
            user.setCompany((String) updates.get("company"));
        }
        if (updates.containsKey("avatarUrl")) {
            user.setAvatarUrl((String) updates.get("avatarUrl"));
        }
        if (updates.containsKey("notificationsEnabled")) {
            user.setNotificationsEnabled((Boolean) updates.get("notificationsEnabled"));
        }
        if (updates.containsKey("twoFactorEnabled")) {
            user.setTwoFactorEnabled((Boolean) updates.get("twoFactorEnabled"));
        }

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    // Смена пароля текущего пользователя
    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwordData) {
        String email = getCurrentUserEmail();
        if (email == null) {
            return ResponseEntity.status(401).body("Пользователь не аутентифицирован");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        String currentPassword = passwordData.get("currentPassword");
        String newPassword = passwordData.get("newPassword");

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body("Текущий пароль неверен");
        }

        if (newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body("Новый пароль обязателен");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok().body("Пароль успешно изменён");
    }
}