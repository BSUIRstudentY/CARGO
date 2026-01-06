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

@DisplayName("ReferralController Integration Tests")
class ReferralControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("referraluser@example.com");
        testUser.setUsername("referraluser");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setRole("USER");
        testUser.setReferralCode("REF123");
        userRepository.save(testUser);
    }

    @Test
    @DisplayName("GET /api/referrals/user - Should get user referral data")
    @WithMockUser(username = "referraluser@example.com")
    void testGetUserReferralData() throws Exception {
        mockMvc.perform(get("/api/referrals/user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("referraluser@example.com"))
                .andExpect(jsonPath("$.referralCode").value("REF123"));
    }

    @Test
    @DisplayName("POST /api/referrals/activate - Should activate referral code")
    @WithMockUser(username = "referraluser@example.com")
    void testActivateReferral() throws Exception {
        // Create user with referral code
        User referrer = new User();
        referrer.setEmail("referrer@example.com");
        referrer.setUsername("referrer");
        referrer.setPassword(passwordEncoder.encode("password123"));
        referrer.setRole("USER");
        referrer.setReferralCode("REFERRER123");
        userRepository.save(referrer);

        mockMvc.perform(post("/api/referrals/activate")
                        .param("referralCode", "REFERRER123"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/referrals - Should get all referrals")
    @WithMockUser(username = "referraluser@example.com")
    void testGetAllReferrals() throws Exception {
        mockMvc.perform(get("/api/referrals"))
                .andExpect(status().isOk());
    }
}




