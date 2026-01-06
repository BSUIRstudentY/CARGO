package com.example.demo.integration;

import com.example.demo.Entities.Review;
import com.example.demo.Repositories.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("ReviewController Integration Tests")
class ReviewControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private ReviewRepository reviewRepository;

    private Review testReview;

    @BeforeEach
    void setUp() {
        testReview = new Review();
        testReview.setName("Test Reviewer");
        testReview.setRating((byte) 5);
        testReview.setText("Great product!");
        reviewRepository.save(testReview);
    }

    @Test
    @DisplayName("GET /api/reviews - Should get all reviews with pagination")
    void testGetAllReviews() throws Exception {
        mockMvc.perform(get("/api/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("GET /api/reviews/{id} - Should get review by ID")
    void testGetReviewById() throws Exception {
        mockMvc.perform(get("/api/reviews/" + testReview.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testReview.getId()))
                .andExpect(jsonPath("$.rating").value(5));
    }

    @Test
    @DisplayName("POST /api/reviews - Should create review")
    void testCreateReview() throws Exception {
        String requestBody = """
                {
                    "name": "New Reviewer",
                    "rating": 4,
                    "text": "Good product"
                }
                """;

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Reviewer"))
                .andExpect(jsonPath("$.rating").value(4))
                .andExpect(jsonPath("$.text").value("Good product"));
    }
}

