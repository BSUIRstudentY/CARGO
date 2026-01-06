package com.example.demo.integration;

import com.example.demo.Entities.DiscountType;
import com.example.demo.Entities.Quest;
import com.example.demo.Entities.QuestConditionType;
import com.example.demo.Entities.RewardType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("QuestController Integration Tests")
class QuestControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("POST /api/quest - Should create quest")
    @WithMockUser(roles = "ADMIN")
    void testCreateQuest() throws Exception {
        String requestBody = """
                {
                    "name": "Test Quest",
                    "description": "Test quest description",
                    "questConditionType": "QUANTITY_ORDER",
                    "targetValue": 5,
                    "rewardType": "TEMPORARY",
                    "reward": 10.0
                }
                """;

        mockMvc.perform(post("/api/quest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/quest - Should get all quests")
    @WithMockUser(roles = "ADMIN")
    void testGetAllQuests() throws Exception {
        mockMvc.perform(get("/api/quest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}

