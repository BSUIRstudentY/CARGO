package com.example.demo.integration;

import com.example.demo.Entities.User;
import com.example.demo.Repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("AdminStatsController Integration Tests")
class AdminStatsControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setEmail("admin@example.com");
        user.setUsername("admin");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole("ADMIN");
        userRepository.save(user);
    }

    @Test
    @DisplayName("GET /api/admin/stats - Should return admin statistics")
    void testGetAdminStats() throws Exception {
        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalClients").exists())
                .andExpect(jsonPath("$.currentOrders").exists());
    }
}








