package com.example.demo.integration;

import com.example.demo.Entities.DiscountType;
import com.example.demo.Entities.Promocode;
import com.example.demo.Repositories.PromocodeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("PromocodeController Integration Tests")
class PromocodeControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private PromocodeRepository promocodeRepository;

    private Promocode testPromocode;

    @BeforeEach
    void setUp() {
        testPromocode = new Promocode();
        testPromocode.setCode("TESTPROMO");
        testPromocode.setDiscountType(DiscountType.PERCENTAGE);
        testPromocode.setDiscountValue(10.0f);
        testPromocode.setValidFrom(LocalDateTime.now().minusDays(1));
        testPromocode.setValidUntil(LocalDateTime.now().plusDays(30));
        testPromocode.setIsActive(true);
        testPromocode.setUsedCount(0);
        testPromocode.setUsageLimit(100);
        promocodeRepository.save(testPromocode);
    }

    @Test
    @DisplayName("POST /api/promocodes/validate - Should validate valid promocode")
    void testValidatePromocode_Valid() throws Exception {
        String requestBody = """
                {
                    "code": "TESTPROMO"
                }
                """;

        mockMvc.perform(post("/api/promocodes/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.discountType").exists())
                .andExpect(jsonPath("$.discountValue").exists());
    }

    @Test
    @DisplayName("POST /api/promocodes/validate - Should return 400 for invalid promocode")
    void testValidatePromocode_Invalid() throws Exception {
        String requestBody = """
                {
                    "code": "INVALID"
                }
                """;

        mockMvc.perform(post("/api/promocodes/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/promocodes - Should get all promocodes")
    @WithMockUser(roles = "ADMIN")
    void testGetAllPromocodes() throws Exception {
        mockMvc.perform(get("/api/promocodes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("POST /api/promocodes - Should create promocode")
    @WithMockUser(roles = "ADMIN")
    void testCreatePromocode() throws Exception {
        String requestBody = """
                {
                    "code": "NEWPROMO",
                    "discountType": "PERCENTAGE",
                    "discountValue": 15.0,
                    "validFrom": "2024-01-01T00:00:00",
                    "validUntil": "2024-12-31T23:59:59",
                    "usageLimit": 50
                }
                """;

        mockMvc.perform(post("/api/promocodes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }
}




