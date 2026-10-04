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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("ProductController Integration Tests")
class ProductControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private ProductRepository productRepository;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        testProduct = new Product();
        testProduct.setId("PROD-TEST-001");
        testProduct.setName("Test Product");
        testProduct.setUrl("https://example.com/test");
        testProduct.setPrice(100.0f);
        testProduct.setStatus("ACTIVE");
        testProduct.setLastUpdated(new Timestamp(System.currentTimeMillis()));
        testProduct.setOriginCountry("China");
        productRepository.save(testProduct);
    }

    @Test
    @DisplayName("POST /api/products - Should create product successfully")
    @WithMockUser(roles = "ADMIN")
    void testCreateProduct_Success() throws Exception {
        String requestBody = """
                {
                    "id": "PROD-NEW-001",
                    "name": "New Product",
                    "url": "https://example.com/new",
                    "price": 150.0,
                    "status": "ACTIVE",
                    "originCountry": "China"
                }
                """;

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("PROD-NEW-001"))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("POST /api/products - Should return 400 when ID is missing")
    @WithMockUser(roles = "ADMIN")
    void testCreateProduct_MissingId() throws Exception {
        String requestBody = """
                {
                    "name": "New Product",
                    "url": "https://example.com/new",
                    "price": 150.0
                }
                """;

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/products/bulk - Should create multiple products")
    @WithMockUser(roles = "ADMIN")
    void testCreateBulkProducts_Success() throws Exception {
        String requestBody = """
                [
                    {
                        "id": "PROD-BULK-001",
                        "name": "Bulk Product 1",
                        "url": "https://example.com/bulk1",
                        "price": 100.0,
                        "originCountry": "China"
                    },
                    {
                        "id": "PROD-BULK-002",
                        "name": "Bulk Product 2",
                        "url": "https://example.com/bulk2",
                        "price": 200.0,
                        "originCountry": "China"
                    }
                ]
                """;

        mockMvc.perform(post("/api/products/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.count").value(2));
    }

    @Test
    @DisplayName("GET /api/products - Should return products with pagination")
    void testGetProducts_Default() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalPages").exists());
    }

    @Test
    @DisplayName("GET /api/products/{id} - Should return product by ID")
    void testGetProductById_Success() throws Exception {
        mockMvc.perform(get("/api/products/PROD-TEST-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("PROD-TEST-001"))
                .andExpect(jsonPath("$.name").value("Test Product"));
    }

    @Test
    @DisplayName("GET /api/products/{id} - Should return 404 for non-existent product")
    void testGetProductById_NotFound() throws Exception {
        mockMvc.perform(get("/api/products/NON-EXISTENT"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/products/{id} - Should update product")
    @WithMockUser(roles = "ADMIN")
    void testUpdateProduct_Success() throws Exception {
        String requestBody = """
                {
                    "id": "PROD-TEST-001",
                    "name": "Updated Product",
                    "url": "https://example.com/test",
                    "price": 150.0,
                    "status": "ACTIVE"
                }
                """;

        mockMvc.perform(put("/api/products/PROD-TEST-001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("DELETE /api/products/{id} - Should delete product")
    @WithMockUser(roles = "ADMIN")
    void testDeleteProduct_Success() throws Exception {
        mockMvc.perform(delete("/api/products/PROD-TEST-001"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/products - Should filter by search term")
    void testGetProducts_SearchTerm() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("searchTerm", "Test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }
}

