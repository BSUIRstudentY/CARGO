package com.example.demo.Components;

import org.springframework.security.core.context.SecurityContextHolder;


public class ContextHolder {


    public static String getCurrentUserEmail() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            System.out.println("User: " + email + ", Authorities: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
            return email;
        } catch (Exception e) {
            System.out.println("Error getting user email: " + e.getMessage());
            return null;
        }
    }
}
