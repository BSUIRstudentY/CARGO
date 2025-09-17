package com.example.demo.Services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
public class UserActivityService {
    private static final Logger logger = LoggerFactory.getLogger(UserActivityService.class);
    private static final String ACTIVITY_KEY_PREFIX = "user:activity:";

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void updateUserActivity(String userEmail) {
        logger.debug("Updating activity for user: {}", userEmail);
        String key = ACTIVITY_KEY_PREFIX + userEmail;
        redisTemplate.opsForValue().set(key, LocalDateTime.now().toString(), 5, TimeUnit.MINUTES);
        int onlineCount = getOnlineUsersCount();
        logger.debug("Broadcasting online count after login: {}", onlineCount);
        messagingTemplate.convertAndSend("/topic/online", onlineCount);
    }

    public void removeUserActivity(String userEmail) {
        logger.debug("Removing activity for user: {}", userEmail);
        redisTemplate.delete(ACTIVITY_KEY_PREFIX + userEmail);
        int onlineCount = getOnlineUsersCount();
        logger.debug("Broadcasting online count after logout: {}", onlineCount);
        messagingTemplate.convertAndSend("/topic/online", onlineCount);
    }

    public int getOnlineUsersCount() {
        Set<String> keys = redisTemplate.keys(ACTIVITY_KEY_PREFIX + "*");
        int count = keys != null ? keys.size() : 0;
        logger.debug("Online users count: {}", count);
        return count;
    }
}