package com.example.demo.integration;

import com.example.demo.Entities.*;
import com.example.demo.Repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;

import java.sql.Timestamp;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("OrderController Integration Tests")
class OrderControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private Product testProduct;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("orderuser@example.com");
        testUser.setUsername("orderuser");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setRole("USER");
        userRepository.save(testUser);

        testProduct = new Product();
        testProduct.setId("PROD-ORDER-001");
        testProduct.setName("Order Product");
        testProduct.setUrl("https://example.com/order");
        testProduct.setPrice(100.0f);
        testProduct.setStatus("ACTIVE");
        testProduct.setLastUpdated(new Timestamp(System.currentTimeMillis()));
        testProduct.setOriginCountry("China");
        productRepository.save(testProduct);

        testOrder = new Order();
        testOrder.setUser(testUser);
        testOrder.setOrderNumber(UUID.randomUUID().toString());
        testOrder.setDateCreated(new Timestamp(System.currentTimeMillis()));
        testOrder.setStatus("PENDING");
        testOrder.setTotalClientPrice(100.0f);
        testOrder.setDeliveryAddress("Test Address");
        orderRepository.save(testOrder);
    }

    @Test
    @DisplayName("GET /api/orders/{id} - Should get order by ID")
    @WithMockUser(username = "orderuser@example.com")
    void testGetOrderById() throws Exception {
        mockMvc.perform(get("/api/orders/" + testOrder.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testOrder.getId()));
    }

    @Test
    @DisplayName("GET /api/orders - Should get orders with pagination")
    @WithMockUser(username = "orderuser@example.com")
    void testGetOrders() throws Exception {
        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("POST /api/orders/self-pickup - Should create self-pickup order")
    @WithMockUser(username = "orderuser@example.com")
    void testCreateSelfPickupOrder() throws Exception {
        String requestBody = """
                {
                    "trackingNumbers": ["TRACK001", "TRACK002"],
                    "deliveryAddress": "Test Address"
                }
                """;

        mockMvc.perform(post("/api/orders/self-pickup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }
}




