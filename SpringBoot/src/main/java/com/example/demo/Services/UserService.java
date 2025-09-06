package com.example.demo.Services;

import com.example.demo.Entities.User;
import com.example.demo.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void verifyAndSaveUserDiscount(User user) {
        System.out.println("Before verifyDiscount: " + user.getEmail() + ", temporaryDiscountExpired: " + user.getTemporaryDiscountExpired());
        user.verifyDiscount();
        System.out.println("After verifyDiscount: " + user.getEmail() + ", temporaryDiscountExpired: " + user.getTemporaryDiscountExpired());
        userRepository.save(user);
        System.out.println("Saved user: " + user.getEmail());
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
}