package com.example.demo.integration;

import com.example.demo.Entities.User;
import com.example.demo.Repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;


import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("BatchCargoController Integration Tests")
class BatchCargoControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("batchuser@example.com");
        testUser.setUsername("batchuser");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setRole("USER");
        userRepository.save(testUser);
    }

    @Test
    @DisplayName("GET /api/batch-cargos/unfinished - Should get unfinished batches")
    void testGetUnfinishedBatches() throws Exception {
        mockMvc.perform(get("/api/batch-cargos/unfinished"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("GET /api/batch-cargos/finished - Should get finished batches")
    void testGetFinishedBatches() throws Exception {
        mockMvc.perform(get("/api/batch-cargos/finished"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("GET /api/batch-cargos/departure - Should get departure batches")
    @WithMockUser(username = "batchuser@example.com")
    void testGetDeparture() throws Exception {
        mockMvc.perform(get("/api/batch-cargos/departure"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("POST /api/batch-cargos - Should create batch cargo")
    @WithMockUser(username = "batchuser@example.com")
    void testCreateBatchCargo() throws Exception {
        // Note: purchaseDate is a Date object, using timestamp in milliseconds
        long timestamp = System.currentTimeMillis();
        String requestBody = String.format("""
                {
                    "purchaseDate": %d,
                    "photoUrl": "https://example.com/photo.jpg",
                    "description": "Test batch"
                }
                """, timestamp);

        mockMvc.perform(post("/api/batch-cargos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }
}

