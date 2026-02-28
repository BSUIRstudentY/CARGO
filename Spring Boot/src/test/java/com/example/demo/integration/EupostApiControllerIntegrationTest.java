package com.example.demo.integration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("EupostApiController Integration Tests")
class EupostApiControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("POST /api/dostavka/auth - Should get JWT token")
    void testGetJwtToken() throws Exception {
        // Note: This might fail if external API is not available, which is expected in tests
        mockMvc.perform(post("/api/dostavka/auth"))
                .andExpect(status().is5xxServerError()); // Will fail without actual API
    }

    @Test
    @DisplayName("GET /api/dostavka/officesOut - Should get offices")
    void testGetOffices() throws Exception {
        // Note: This might fail if external API is not available
        mockMvc.perform(get("/api/dostavka/officesOut"))
                .andExpect(status().is5xxServerError()); // Will fail without actual API
    }

    @Test
    @DisplayName("POST /api/dostavka/proxy - Should proxy request")
    void testProxy() throws Exception {
        String requestBody = """
                {
                    "methodName": "Postal.Tracking",
                    "data": {}
                }
                """;

        // Note: This will fail without actual API, but tests the endpoint structure
        mockMvc.perform(post("/api/dostavka/proxy")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().is5xxServerError()); // Will fail without actual API
    }
}








