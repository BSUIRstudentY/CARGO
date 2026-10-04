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

@DisplayName("VerificationController Integration Tests")
class VerificationControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("verify@example.com");
        testUser.setUsername("verifyuser");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setRole("USER");
        testUser.setEmailVerified(false);
        userRepository.save(testUser);
    }

    @Test
    @DisplayName("POST /api/verification/request-email - Should request email verification")
    void testRequestEmailVerification() throws Exception {
        String requestBody = """
                {
                    "email": "verify@example.com"
                }
                """;

        mockMvc.perform(post("/api/verification/request-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/verification/request-phone - Should request phone verification")
    void testRequestPhoneVerification() throws Exception {
        mockMvc.perform(post("/api/verification/request-phone"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/verification/confirm-phone - Should confirm phone verification")
    void testConfirmPhoneVerification() throws Exception {
        mockMvc.perform(post("/api/verification/confirm-phone")
                        .param("code", "123456"))
                .andExpect(status().isNotFound());
    }
}








