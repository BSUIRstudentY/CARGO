package com.example.demo.Controllers;

import com.example.demo.Services.AuthService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        HashMap<String, String> map = authService.login(authRequest.getEmail(), authRequest.getPassword());
        return ResponseEntity.ok(new AuthResponse(map));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        String token = authService.register(registerRequest.getEmail(), registerRequest.getPassword(), registerRequest.getUsername());
        return ResponseEntity.ok(new AuthResponse(token));
    }
}

class AuthRequest {
    private String email;
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
    private String email;
    private String password;
    private String username;
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