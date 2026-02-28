package com.example.demo.integration;

import com.example.demo.Entities.User;
import com.example.demo.Repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("TelegramController Integration Tests")
class TelegramControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("telegram@example.com");
        testUser.setUsername("telegramuser");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setRole("USER");
        testUser.setReferralCode("TELEGRAM123");
        testUser.setTelegramUserId(null); // Not verified yet
        userRepository.save(testUser);
    }

    @Test
    @DisplayName("POST /api/telegram - Should verify telegram")
    void testVerifyTelegram() throws Exception {
        String requestBody = """
                {
                    "userId": "123456789",
                    "referralCode": "TELEGRAM123"
                }
                """;

        mockMvc.perform(post("/api/telegram")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/telegram - Should return 400 for invalid request")
    void testVerifyTelegram_Invalid() throws Exception {
        String requestBody = """
                {
                    "userId": null,
                    "referralCode": null
                }
                """;

        mockMvc.perform(post("/api/telegram")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }
}








