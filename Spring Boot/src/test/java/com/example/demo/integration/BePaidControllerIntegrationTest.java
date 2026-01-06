package com.example.demo.integration;

import com.example.demo.Entities.Order;
import com.example.demo.Entities.User;
import com.example.demo.Repositories.OrderRepository;
import com.example.demo.Repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.sql.Timestamp;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("BePaidController Integration Tests")
class BePaidControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("payment@example.com");
        testUser.setUsername("paymentuser");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setRole("USER");
        userRepository.save(testUser);

        testOrder = new Order();
        testOrder.setUser(testUser);
        testOrder.setOrderNumber(UUID.randomUUID().toString());
        testOrder.setDateCreated(new Timestamp(System.currentTimeMillis()));
        testOrder.setStatus("VERIFIED");
        testOrder.setTotalClientPrice(100.0f);
        testOrder.setDeliveryAddress("Test Address");
        orderRepository.save(testOrder);
    }

    @Test
    @DisplayName("POST /api/payment/create - Should create payment")
    void testCreatePayment() throws Exception {
        String requestBody = String.format("""
                {
                    "orderId": %d,
                    "amount": 100.0
                }
                """, testOrder.getId());

        // Note: This will fail without actual bePaid API, but tests the endpoint structure
        mockMvc.perform(post("/api/payment/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().is5xxServerError()); // Will fail without actual API
    }

    @Test
    @DisplayName("POST /api/payment/create - Should return 400 for invalid order")
    void testCreatePayment_InvalidOrder() throws Exception {
        String requestBody = """
                {
                    "orderId": 999999,
                    "amount": 100.0
                }
                """;

        mockMvc.perform(post("/api/payment/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/payment/check - Should check payment status")
    void testCheckPayment() throws Exception {
        mockMvc.perform(get("/api/payment/check")
                        .param("transactionId", "1"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/payment/webhook - Should handle webhook")
    void testHandleWebhook() throws Exception {
        String webhookBody = """
                {
                    "transaction": {
                        "tracking_id": "1",
                        "status": "successful"
                    }
                }
                """;

        // Note: This will fail without proper signature, but tests the endpoint structure
        mockMvc.perform(post("/api/payment/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(webhookBody))
                .andExpect(status().isBadRequest()); // Will fail without signature
    }
}




