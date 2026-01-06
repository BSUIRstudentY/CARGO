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
import java.util.ArrayList;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("CartController Integration Tests")
class CartControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("cartuser@example.com");
        testUser.setUsername("cartuser");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setRole("USER");
        userRepository.save(testUser);

        testProduct = new Product();
        testProduct.setId("PROD-CART-001");
        testProduct.setName("Cart Product");
        testProduct.setUrl("https://example.com/cart");
        testProduct.setPrice(100.0f);
        testProduct.setStatus("ACTIVE");
        testProduct.setLastUpdated(new Timestamp(System.currentTimeMillis()));
        testProduct.setOriginCountry("China");
        productRepository.save(testProduct);
    }

    @Test
    @DisplayName("GET /api/cart - Should get empty cart for new user")
    @WithMockUser(username = "cartuser@example.com")
    void testGetCart_Empty() throws Exception {
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("GET /api/cart - Should return 403 without authentication")
    void testGetCart_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isForbidden());
    }
}




