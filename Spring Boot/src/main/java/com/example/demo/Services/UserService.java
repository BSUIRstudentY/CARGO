package com.example.demo.Services;

import com.example.demo.Entities.User;
import com.example.demo.Repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.util.Optional;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void verifyAndSaveUserDiscount(User user) {
        logger.debug("Verifying discount for user: {}, temporaryDiscountExpired: {}", 
                user.getEmail(), user.getTemporaryDiscountExpired());
        user.verifyDiscount();
        userRepository.save(user);
        logger.debug("Discount verified and user saved: {}", user.getEmail());
    }

    public User getUserByEmail(String email) {
        return userRepository.findById(email).orElse(null);
    }

    public User getUserByReferralCode(String referralCode) {
        return userRepository.findByReferralCode(referralCode).orElse(null);
    }

    @Transactional
    public void saveUser(User user) {
        userRepository.save(user);
    }


    public String getCurrentUserEmail() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return null;
        }
    }


    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User save(User user) {
        return userRepository.save(user);
    }
}

