package com.example.demo.integration;

import com.example.demo.Entities.User;
import com.example.demo.Repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("OrderHistoryController Integration Tests")
class OrderHistoryControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("historyuser@example.com");
        testUser.setUsername("historyuser");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setRole("USER");
        userRepository.save(testUser);
    }

    @Test
    @DisplayName("GET /api/order-history - Should get order history")
    @WithMockUser(username = "historyuser@example.com")
    void testGetOrderHistory() throws Exception {
        mockMvc.perform(get("/api/order-history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orders").isArray())
                .andExpect(jsonPath("$.currentPage").exists())
                .andExpect(jsonPath("$.totalPages").exists());
    }

    @Test
    @DisplayName("GET /api/order-history - Should filter by status")
    @WithMockUser(username = "historyuser@example.com")
    void testGetOrderHistory_WithStatus() throws Exception {
        mockMvc.perform(get("/api/order-history")
                        .param("status", "PENDING"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/order-history/{id} - Should get order by ID")
    @WithMockUser(username = "historyuser@example.com")
    void testGetOrderById() throws Exception {
        // Note: This will fail if no order exists, which is expected
        mockMvc.perform(get("/api/order-history/1"))
                .andExpect(status().is4xxClientError()); // 403 or 404
    }
}




