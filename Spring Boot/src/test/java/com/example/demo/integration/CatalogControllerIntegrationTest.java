package com.example.demo.integration;

import com.example.demo.Entities.Catalog;
import com.example.demo.Entities.Product;
import com.example.demo.Repositories.CatalogRepository;
import com.example.demo.Repositories.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.sql.Timestamp;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("CatalogController Integration Tests")
class CatalogControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private CatalogRepository catalogRepository;

    @Autowired
    private ProductRepository productRepository;

    private Product product1;
    private Product product2;

    @BeforeEach
    void setUp() {
        // Create test products
        product1 = new Product();
        product1.setId("PROD-001");
        product1.setName("Test Product 1");
        product1.setUrl("https://example.com/product1");
        product1.setPrice(100.0f);
        product1.setStatus("ACTIVE");
        product1.setLastUpdated(new Timestamp(System.currentTimeMillis()));
        product1.setOriginCountry("China");
        productRepository.save(product1);

        product2 = new Product();
        product2.setId("PROD-002");
        product2.setName("Test Product 2");
        product2.setUrl("https://example.com/product2");
        product2.setPrice(200.0f);
        product2.setStatus("ACTIVE");
        product2.setLastUpdated(new Timestamp(System.currentTimeMillis()));
        product2.setOriginCountry("China");
        productRepository.save(product2);

        // Create catalog entries
        Catalog catalog1 = new Catalog();
        catalog1.setProduct(product1);
        catalogRepository.save(catalog1);

        Catalog catalog2 = new Catalog();
        catalog2.setProduct(product2);
        catalogRepository.save(catalog2);
    }

    @Test
    @DisplayName("GET /api/catalog - Should return catalog with pagination")
    void testGetCatalog_DefaultPagination() throws Exception {
        mockMvc.perform(get("/api/catalog"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalPages").exists())
                .andExpect(jsonPath("$.totalElements").exists());
    }

    @Test
    @DisplayName("GET /api/catalog - Should return catalog with custom pagination")
    void testGetCatalog_CustomPagination() throws Exception {
        mockMvc.perform(get("/api/catalog")
                        .param("page", "0")
                        .param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(1));
    }

    @Test
    @DisplayName("GET /api/catalog - Should filter by search term")
    void testGetCatalog_SearchTerm() throws Exception {
        mockMvc.perform(get("/api/catalog")
                        .param("searchTerm", "Product 1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].name").value("Test Product 1"));
    }

    @Test
    @DisplayName("GET /api/catalog - Should filter by price range")
    void testGetCatalog_PriceRange() throws Exception {
        mockMvc.perform(get("/api/catalog")
                        .param("minPrice", "50")
                        .param("maxPrice", "150"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("GET /api/catalog - Should sort by price ascending")
    void testGetCatalog_SortByPriceAsc() throws Exception {
        mockMvc.perform(get("/api/catalog")
                        .param("sortBy", "price_asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("GET /api/catalog - Should sort by price descending")
    void testGetCatalog_SortByPriceDesc() throws Exception {
        mockMvc.perform(get("/api/catalog")
                        .param("sortBy", "price_desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }
}




