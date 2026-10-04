package com.example.demo.integration;

import com.example.demo.Entities.Notification;
import com.example.demo.Entities.User;
import com.example.demo.Repositories.NotificationRepository;
import com.example.demo.Repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("NotificationController Integration Tests")
class NotificationControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private Notification testNotification;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("notify@example.com");
        testUser.setUsername("notifyuser");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setRole("USER");
        userRepository.save(testUser);

        testNotification = new Notification();
        testNotification.setUser(testUser);
        testNotification.setMessage("Test notification");
        testNotification.setTimestamp(LocalDateTime.now());
        testNotification.setRead(false);
        testNotification.setCategory("TEST");
        notificationRepository.save(testNotification);
    }

    @Test
    @DisplayName("GET /api/notifications - Should get notifications")
    @WithMockUser(username = "notify@example.com")
    void testGetNotifications() throws Exception {
        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("POST /api/notifications - Should create notification")
    @WithMockUser(username = "notify@example.com", roles = "ADMIN")
    void testCreateNotification() throws Exception {
        String requestBody = """
                {
                    "userEmail": "notify@example.com",
                    "message": "New notification",
                    "category": "TEST",
                    "relatedId": 1
                }
                """;

        mockMvc.perform(post("/api/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("PUT /api/notifications/{id} - Should update notification")
    @WithMockUser(username = "notify@example.com")
    void testUpdateNotification() throws Exception {
        String requestBody = """
                {
                    "isRead": true
                }
                """;

        mockMvc.perform(put("/api/notifications/" + testNotification.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("PUT /api/notifications/mark-all-read - Should mark all as read")
    @WithMockUser(username = "notify@example.com")
    void testMarkAllRead() throws Exception {
        mockMvc.perform(put("/api/notifications/mark-all-read"))
                .andExpect(status().isOk());
    }
}

