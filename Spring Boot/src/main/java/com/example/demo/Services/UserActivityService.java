package com.example.demo.Services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class UserActivityService {
    private static final Logger logger = LoggerFactory.getLogger(UserActivityService.class);
    private static final long ACTIVITY_TIMEOUT_MINUTES = 5;
    
    private final ConcurrentHashMap<String, LocalDateTime> userActivityMap = new ConcurrentHashMap<>();

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void updateUserActivity(String userEmail) {
        logger.debug("Updating activity for user: {}", userEmail);
        userActivityMap.put(userEmail, LocalDateTime.now());
        int onlineCount = getOnlineUsersCount();
        logger.debug("Broadcasting online count after login: {}", onlineCount);
        messagingTemplate.convertAndSend("/topic/online", onlineCount);
    }

    public void removeUserActivity(String userEmail) {
        logger.debug("Removing activity for user: {}", userEmail);
        userActivityMap.remove(userEmail);
        int onlineCount = getOnlineUsersCount();
        logger.debug("Broadcasting online count after logout: {}", onlineCount);
        messagingTemplate.convertAndSend("/topic/online", onlineCount);
    }

    public int getOnlineUsersCount() {
        cleanupExpiredActivities();
        int count = userActivityMap.size();
        logger.debug("Online users count: {}", count);
        return count;
    }

    /**
     * Cleanup expired activities (users inactive for more than ACTIVITY_TIMEOUT_MINUTES)
     */
    @Scheduled(fixedRate = 60000) // Run every minute
    private void cleanupExpiredActivities() {
        LocalDateTime now = LocalDateTime.now();
        userActivityMap.entrySet().removeIf(entry -> {
            LocalDateTime lastActivity = entry.getValue();
            long minutesSinceActivity = java.time.Duration.between(lastActivity, now).toMinutes();
            return minutesSinceActivity > ACTIVITY_TIMEOUT_MINUTES;
        });
    }
}