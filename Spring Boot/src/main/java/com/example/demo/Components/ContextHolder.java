package com.example.demo.Components;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;


public class ContextHolder {
    private static final Logger logger = LoggerFactory.getLogger(ContextHolder.class);

    public static String getCurrentUserEmail() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            logger.debug("Current user: {}, Authorities: {}", email, 
                    SecurityContextHolder.getContext().getAuthentication().getAuthorities());
            return email;
        } catch (Exception e) {
            logger.warn("Error getting user email: {}", e.getMessage());
            return null;
        }
    }
}
