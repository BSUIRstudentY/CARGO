
        package com.example.demo.Services;

import com.example.demo.Entities.QuestConditionType;
import com.example.demo.Entities.Supplier;
import com.example.demo.Entities.User;
import com.example.demo.POJO.QuestEvent;
import com.example.demo.Repositories.SupplierRepository;
import com.example.demo.Repositories.UserRepository;
import com.example.demo.jwt.JwtUtil;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Optional;
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
    private SupplierRepository supplierRepository;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public HashMap<String, String> loginUser(String email, String password) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (!userOpt.isPresent()) {
                throw new UsernameNotFoundException("User not found with email: " + email);
            }
            User user = userOpt.get();
            String userRole = user.getRole();
            String userEmail = user.getEmail();
            String userName = user.getUsername();

            String token = jwtUtil.generateToken(email, userRole);

            HashMap<String, String> map = new HashMap<>();
            map.put("email", userEmail);
            map.put("username", userName);
            map.put("token", token);
            map.put("userRole", userRole);
            return map;
        } catch (UsernameNotFoundException e) {
            throw new RuntimeException("User not found with email: " + email);
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid password for email: " + email);
        } catch (AuthenticationException e) {
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }

    public HashMap<String, String> loginSupplier(String email, String password) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
            Optional<Supplier> supplierOpt = supplierRepository.findByEmail(email);
            if (!supplierOpt.isPresent()) {
                throw new UsernameNotFoundException("Supplier not found with email: " + email);
            }
            Supplier supplier = supplierOpt.get();
            String userRole = supplier.getRole();
            String userEmail = supplier.getEmail();
            String userName = supplier.getUsername();

            String token = jwtUtil.generateToken(email, userRole);

            HashMap<String, String> map = new HashMap<>();
            map.put("email", userEmail);
            map.put("username", userName);
            map.put("token", token);
            map.put("userRole", userRole);
            return map;
        } catch (UsernameNotFoundException e) {
            throw new RuntimeException("Supplier not found with email: " + email);
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid password for email: " + email);
        } catch (AuthenticationException e) {
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }

    @Transactional
    public String registerUser(String email, String password, String username, String referralCode) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }

        if (userRepository.findByEmail(email).isPresent() || supplierRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("User with email " + email + " already exists");
        }

        User referredByUser = null;
        if (referralCode != null && !referralCode.trim().isEmpty()) {
            referredByUser = userRepository.findByReferralCode(referralCode)
                    .orElseThrow(() -> new RuntimeException("Invalid referral code: " + referralCode));
            referredByUser.incrementReferralCount();
        }

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
            userRepository.save(user);
            if (referredByUser != null) {
                userRepository.save(referredByUser);
                QuestEvent questEvent = new QuestEvent(referredByUser.getEmail(), QuestConditionType.INVITE);
                kafkaTemplate.send("quest", questEvent.getUserEmail(), questEvent);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to save user to database: " + e.getMessage(), e);
        }

        return jwtUtil.generateToken(email, "USER");
    }

    @Transactional
    public String registerSupplier(String email, String password, String username, String companyName, String description, String websiteUrl, String address) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }
        if (companyName == null || companyName.trim().isEmpty()) {
            throw new IllegalArgumentException("Company name cannot be empty");
        }

        if (supplierRepository.existsByEmail(email)) {
            throw new RuntimeException("User with email " + email + " already exists");
        }

        Supplier supplier = new Supplier();
        supplier.setEmail(email.trim());
        supplier.setUsername(username.trim());
        supplier.setPassword(passwordEncoder.encode(password));
        supplier.setRole("CARGO");
        supplier.setCompanyName(companyName.trim());
        supplier.setDescription(description);
        supplier.setWebsiteUrl(websiteUrl);
        supplier.setAddress(address);
        supplier.setCreatedAt(LocalDateTime.now());
        supplier.setReferralCode(UUID.randomUUID().toString());
        supplier.setMoneySpent(0.0);
        supplier.setReferralCount(0);

        try {
            supplierRepository.save(supplier);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save supplier to database: " + e.getMessage(), e);
        }

        return jwtUtil.generateToken(email, "CARGO");
    }

    public boolean existsByReferralCode(String code) {
        return userRepository.existsByReferralCode(code);
    }
}