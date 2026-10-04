package com.example.demo.integration;

import com.example.demo.Entities.Product;
import com.example.demo.Repositories.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.sql.Timestamp;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("ProductReviewController Integration Tests")
class ProductReviewControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private ProductRepository productRepository;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        testProduct = new Product();
        testProduct.setId("PROD-REVIEW-TEST");
        testProduct.setName("Review Test Product");
        testProduct.setUrl("https://example.com/reviewtest");
        testProduct.setPrice(100.0f);
        testProduct.setStatus("ACTIVE");
        testProduct.setLastUpdated(new Timestamp(System.currentTimeMillis()));
        testProduct.setOriginCountry("China");
        productRepository.save(testProduct);
    }

    @Test
    @DisplayName("POST /api/product-reviews - Should create product review")
    @WithMockUser(username = "reviewuser@example.com")
    void testCreateReview() throws Exception {
        String requestBody = """
                {
                    "productId": "PROD-REVIEW-TEST",
                    "rating": 5,
                    "comment": "Great product!"
                }
                """;

        mockMvc.perform(post("/api/product-reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/product-reviews/product/{productId} - Should get reviews by product")
    void testGetReviewsByProductId() throws Exception {
        mockMvc.perform(get("/api/product-reviews/product/PROD-REVIEW-TEST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }
}








