package com.example.demo.Services;

import com.example.demo.Entities.User;
import com.example.demo.Repositories.UserRepository;
import com.example.demo.jwt.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

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

    public String register(String email, String password, String username) {
        // Check if user already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("User with email " + email + " already exists");
        }

        // Create new user
        User user = new User();
        user.setEmail(email);
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("USER"); // Устанавливаем роль по умолчанию

        // Save user to database
        userRepository.save(user);

        // Generate and return JWT token
        return jwtUtil.generateToken(email, "USER");
    }
}