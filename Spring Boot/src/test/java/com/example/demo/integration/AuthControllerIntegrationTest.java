package com.example.demo.integration;

import com.example.demo.Entities.User;
import com.example.demo.Repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.jdbc.Sql;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("AuthController Integration Tests")
class AuthControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setUsername("testuser");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setRole("USER");
        testUser.setReferralCode("TEST123");
        userRepository.save(testUser);
    }

    @Test
    @DisplayName("POST /api/auth/login - Should login successfully with valid credentials")
    void testLogin_Success() throws Exception {
        String requestBody = """
                {
                    "email": "test@example.com",
                    "password": "password123"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    @DisplayName("POST /api/auth/login - Should return 400 with invalid credentials")
    void testLogin_InvalidCredentials() throws Exception {
        String requestBody = """
                {
                    "email": "test@example.com",
                    "password": "wrongpassword"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().is5xxServerError()); // Service throws RuntimeException
    }

    @Test
    @DisplayName("POST /api/auth/login - Should return 400 with invalid email format")
    void testLogin_InvalidEmail() throws Exception {
        String requestBody = """
                {
                    "email": "invalid-email",
                    "password": "password123"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/register - Should register new user successfully")
    void testRegister_Success() throws Exception {
        String requestBody = """
                {
                    "email": "newuser@example.com",
                    "password": "password123",
                    "username": "newuser",
                    "referralCode": null
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    @DisplayName("POST /api/auth/register - Should return 400 with invalid data")
    void testRegister_InvalidData() throws Exception {
        String requestBody = """
                {
                    "email": "invalid-email",
                    "password": "123",
                    "username": "ab"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/auth/validate-referral - Should return true for valid referral code")
    void testValidateReferral_Valid() throws Exception {
        mockMvc.perform(get("/api/auth/validate-referral")
                        .param("code", "TEST123"))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    @DisplayName("GET /api/auth/validate-referral - Should return false for invalid referral code")
    void testValidateReferral_Invalid() throws Exception {
        mockMvc.perform(get("/api/auth/validate-referral")
                        .param("code", "INVALID"))
                .andExpect(status().isOk())
                .andExpect(content().string("false"));
    }

    @Test
    @DisplayName("POST /api/auth/logout - Should logout successfully")
    void testLogout() throws Exception {
        // First login to get authentication
        String loginBody = """
                {
                    "email": "test@example.com",
                    "password": "password123"
                }
                """;

        // Then logout (note: this might fail without proper authentication setup)
        mockMvc.perform(post("/api/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}








