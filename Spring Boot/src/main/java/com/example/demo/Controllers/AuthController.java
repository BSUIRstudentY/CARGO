package com.example.demo.Controllers;

import com.example.demo.Services.AuthService;
import com.example.demo.Services.UserActivityService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;



@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;



    @Autowired
    private UserActivityService userActivityService;

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication() != null ?
                SecurityContextHolder.getContext().getAuthentication().getName() : null;
        if (username != null) {

            userActivityService.removeUserActivity(username);
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("Logout successful");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest authRequest) {
        HashMap<String, String> map = authService.login(authRequest.getEmail(), authRequest.getPassword());
        return ResponseEntity.ok(new AuthResponse(map));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        String token = authService.register(registerRequest.getEmail(), registerRequest.getPassword(), registerRequest.getUsername(), registerRequest.getReferralCode());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @GetMapping("/validate-referral")
    public ResponseEntity<Boolean> validateReferral(@RequestParam String code) {
        return ResponseEntity.ok(authService.existsByReferralCode(code));
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