package com.example.demo.Controllers;

import com.example.demo.Entities.User;
import com.example.demo.Services.AuthService;
import com.example.demo.Services.GmailSenderService;
import com.example.demo.Services.PasswordResetService;
import com.example.demo.Services.UserActivityService;
import com.example.demo.Services.UserService;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Optional;



@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private UserActivityService userActivityService;

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private GmailSenderService gmailSenderService;

    @Autowired
    private UserService userService;

    /** Имя куки с JWT (httpOnly — недоступна из JavaScript). */
    private static final String AUTH_COOKIE_NAME = "auth_token";

    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs;

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        String username = SecurityContextHolder.getContext().getAuthentication() != null ?
                SecurityContextHolder.getContext().getAuthentication().getName() : null;
        if (username != null) {

            userActivityService.removeUserActivity(username);
        }
        SecurityContextHolder.clearContext();
        clearAuthCookie(response);
        return ResponseEntity.ok("Logout successful");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest authRequest, HttpServletRequest request, HttpServletResponse response) {
        HashMap<String, String> map = authService.login(authRequest.getEmail(), authRequest.getPassword());
        String token = map.get("token");
        if (token != null) {
            addAuthCookie(response, token, request.isSecure());
        }
        return ResponseEntity.ok(new AuthResponse(map));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest, HttpServletRequest request, HttpServletResponse response) {
        String token = authService.register(registerRequest.getEmail(), registerRequest.getPassword(), registerRequest.getUsername(), registerRequest.getReferralCode());
        if (token != null) {
            addAuthCookie(response, token, request.isSecure());
        }
        return ResponseEntity.ok(new AuthResponse(token));
    }

    private void addAuthCookie(HttpServletResponse response, String token, boolean secure) {
        int maxAgeSeconds = (int) (jwtExpirationMs / 1000);
        StringBuilder sb = new StringBuilder(AUTH_COOKIE_NAME).append('=').append(token)
                .append("; Path=/; HttpOnly; SameSite=Lax; Max-Age=").append(maxAgeSeconds);
        if (secure) {
            sb.append("; Secure");
        }
        response.addHeader("Set-Cookie", sb.toString());
    }

    private void clearAuthCookie(HttpServletResponse response) {
        response.addHeader("Set-Cookie", AUTH_COOKIE_NAME + "=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
    }

    @GetMapping("/validate-referral")
    public ResponseEntity<Boolean> validateReferral(@RequestParam String code) {
        return ResponseEntity.ok(authService.existsByReferralCode(code));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            String email = request.getEmail();
            logger.info("Received request to send password reset code to email: {}", email);
            
            if (email == null || email.isEmpty()) {
                logger.warn("Email parameter is missing or empty");
                return ResponseEntity.badRequest().body("Email обязателен");
            }

            Optional<User> userOptional = userService.findByEmail(email);
            if (userOptional.isEmpty()) {
                logger.warn("User with email {} not found", email);
                return ResponseEntity.badRequest().body("Пользователь с таким email не найден");
            }

            String code = passwordResetService.generatePasswordResetCode(email);
            logger.info("Generated password reset code for email {}: {}", email, code);
            gmailSenderService.sendPasswordResetCode(email, code);
            logger.info("Password reset code sent successfully to {}", email);
            return ResponseEntity.ok("Код для сброса пароля отправлен на email");
        } catch (MessagingException e) {
            logger.error("Failed to send password reset email to {}: {}", request.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(500).body("Ошибка отправки email: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during password reset request for {}: {}", request.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(500).body("Ошибка запроса сброса пароля: " + e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            String code = request.getCode();
            String newPassword = request.getNewPassword();
            
            logger.info("Received password reset request with code: {}", code);
            
            if (code == null || code.isEmpty()) {
                return ResponseEntity.badRequest().body("Код обязателен");
            }
            
            if (newPassword == null || newPassword.isEmpty()) {
                return ResponseEntity.badRequest().body("Новый пароль обязателен");
            }

            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body("Пароль должен содержать минимум 6 символов");
            }

            String email = passwordResetService.verifyCode(code);
            if (email == null) {
                logger.warn("Invalid or expired password reset code: {}", code);
                return ResponseEntity.badRequest().body("Неверный или истекший код");
            }

            authService.resetPassword(email, newPassword);
            passwordResetService.removeCode(code);
            logger.info("Password reset successfully for email: {}", email);
            return ResponseEntity.ok("Пароль успешно изменен");
        } catch (IllegalArgumentException e) {
            logger.warn("Password reset failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error resetting password: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Ошибка сброса пароля: " + e.getMessage());
        }
    }
}

class AuthRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

@Data
class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;
    
    private String referralCode;
}

@Data
class AuthResponse {
    private String token;
    private String email;
    private String username;

    public AuthResponse(String token) {
        this.token = token;
    }

    public AuthResponse(HashMap<String, String> map) {
        this.token = map.get("token");
        this.email = map.get("email");
        this.username = map.get("username");
    }
}

@Data
class ForgotPasswordRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
}

@Data
class ResetPasswordRequest {
    @NotBlank(message = "Code is required")
    private String code;
    
    @NotBlank(message = "New password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String newPassword;
}