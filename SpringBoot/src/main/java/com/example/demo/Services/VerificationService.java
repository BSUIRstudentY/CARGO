package com.example.demo.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class VerificationService {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    private static final long CODE_TTL_MINUTES = 15;

    public String generateVerificationCode(String email) {
        String code = UUID.randomUUID().toString().substring(0, 6);
        redisTemplate.opsForValue().set(code, email, CODE_TTL_MINUTES, TimeUnit.MINUTES);
        return code;
    }

    public String verifyCode(String code) {
        return redisTemplate.opsForValue().get(code);
    }

    public void removeCode(String code) {
        redisTemplate.delete(code);
    }
}