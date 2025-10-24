
        package com.example.demo.Controllers;

import com.example.demo.Services.AuthService;
import com.example.demo.Services.UserActivityService;
import jakarta.servlet.http.HttpServletRequest;
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

    @PostMapping("/login-user")
    public ResponseEntity<?> loginUser(@RequestBody AuthRequest authRequest) {
        HashMap<String, String> map = authService.loginUser(authRequest.getEmail(), authRequest.getPassword());
        return ResponseEntity.ok(new AuthResponse(map));
    }

    @PostMapping("/login-supplier")
    public ResponseEntity<?> loginSupplier(@RequestBody AuthRequest authRequest) {
        HashMap<String, String> map = authService.loginSupplier(authRequest.getEmail(), authRequest.getPassword());
        return ResponseEntity.ok(new AuthResponse(map));
    }

    @PostMapping("/register-user")
    public ResponseEntity<?> registerUser(@RequestBody RegisterUserRequest registerRequest) {
        String token = authService.registerUser(registerRequest.getEmail(), registerRequest.getPassword(), registerRequest.getUsername(), registerRequest.getReferralCode());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/register-supplier")
    public ResponseEntity<?> registerSupplier(@RequestBody RegisterSupplierRequest registerRequest) {
        String token = authService.registerSupplier(registerRequest.getEmail(), registerRequest.getPassword(), registerRequest.getUsername(), registerRequest.getCompanyName(), registerRequest.getDescription(), registerRequest.getWebsiteUrl(), registerRequest.getAddress());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @GetMapping("/validate-referral")
    public ResponseEntity<Boolean> validateReferral(@RequestParam String code) {
        return ResponseEntity.ok(authService.existsByReferralCode(code));
    }
}

@Data
class AuthRequest {
    private String email;
    private String password;
}

@Data
class RegisterUserRequest {
    private String email;
    private String password;
    private String username;
    private String referralCode;
}

@Data
class RegisterSupplierRequest {
    private String email;
    private String password;
    private String username;
    private String companyName;
    private String description;
    private String websiteUrl;
    private String address;
}

@Data
class AuthResponse {
    private String token;
    private String email;
    private String username;
    private String userRole;

    public AuthResponse(String token) {
        this.token = token;
    }

    public AuthResponse(HashMap<String, String> map) {
        this.token = map.get("token");
        this.email = map.get("email");
        this.username = map.get("username");
        this.userRole = map.get("userRole");
    }
}