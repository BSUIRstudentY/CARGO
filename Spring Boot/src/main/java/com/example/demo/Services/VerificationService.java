package com.example.demo.Services;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VerificationService {

    private static final long CODE_TTL_MINUTES = 15;
    
    private static class CodeEntry {
        String email;
        LocalDateTime createdAt;
        
        CodeEntry(String email) {
            this.email = email;
            this.createdAt = LocalDateTime.now();
        }
    }
    
    private final ConcurrentHashMap<String, CodeEntry> codeMap = new ConcurrentHashMap<>();

    public String generateVerificationCode(String email) {
        String code = UUID.randomUUID().toString().substring(0, 6);
        codeMap.put(code, new CodeEntry(email));
        return code;
    }

    public String verifyCode(String code) {
        CodeEntry entry = codeMap.get(code);
        if (entry == null) {
            return null;
        }
        
        // Check if code is expired
        long minutesSinceCreation = java.time.Duration.between(entry.createdAt, LocalDateTime.now()).toMinutes();
        if (minutesSinceCreation > CODE_TTL_MINUTES) {
            codeMap.remove(code);
            return null;
        }
        
        return entry.email;
    }

    public void removeCode(String code) {
        codeMap.remove(code);
    }
    
    /**
     * Cleanup expired verification codes
     */
    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    private void cleanupExpiredCodes() {
        LocalDateTime now = LocalDateTime.now();
        codeMap.entrySet().removeIf(entry -> {
            long minutesSinceCreation = java.time.Duration.between(entry.getValue().createdAt, now).toMinutes();
            return minutesSinceCreation > CODE_TTL_MINUTES;
        });
    }
}