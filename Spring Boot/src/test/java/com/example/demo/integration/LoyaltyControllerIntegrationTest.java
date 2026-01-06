package com.example.demo.integration;

import com.example.demo.Entities.User;
import com.example.demo.Repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("LoyaltyController Integration Tests")
class LoyaltyControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("loyalty@example.com");
        testUser.setUsername("loyaltyuser");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setRole("USER");
        userRepository.save(testUser);
    }

    @Test
    @DisplayName("GET /api/loyalty/user - Should get user loyalty status")
    @WithMockUser(username = "loyalty@example.com")
    void testGetUserStatus() throws Exception {
        mockMvc.perform(get("/api/loyalty/user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("loyalty@example.com"))
                .andExpect(jsonPath("$.totalDiscount").exists());
    }

    @Test
    @DisplayName("GET /api/loyalty/quests - Should get user quests")
    @WithMockUser(username = "loyalty@example.com")
    void testGetUserQuests() throws Exception {
        mockMvc.perform(get("/api/loyalty/quests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("POST /api/loyalty/activate-referral - Should activate referral")
    @WithMockUser(username = "loyalty@example.com")
    void testActivateReferral() throws Exception {
        // Create referrer user
        User referrer = new User();
        referrer.setEmail("referrer@example.com");
        referrer.setUsername("referrer");
        referrer.setPassword(passwordEncoder.encode("password123"));
        referrer.setRole("USER");
        referrer.setReferralCode("REFERRER123");
        userRepository.save(referrer);

        mockMvc.perform(post("/api/loyalty/activate-referral")
                        .param("referralCode", "REFERRER123"))
                .andExpect(status().isOk());
    }
}




