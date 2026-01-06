package com.example.demo.Entities;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for Product entity business logic.
 * Tests review aggregation, weight calculations, and validation.
 */
@DisplayName("Product Entity Tests")
class ProductTest {

    private Product product;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setId("PROD-001");
        product.setName("Test Product");
        product.setPrice(100.0f);
        product.setStatus("ACTIVE");
        product.setOriginCountry("China");
    }

    @Test
    @DisplayName("Should add review and update statistics")
    void testAddReview_FirstReview() {
        // When
        product.addReview(5);

        // Then
        assertEquals(5, product.getTotalReviewSumm());
        assertEquals(1, product.getReviewQuantity());
        assertEquals(5.0, product.getAverageRating(), 0.01);
    }

    @Test
    @DisplayName("Should accumulate multiple reviews")
    void testAddReview_MultipleReviews() {
        // When
        product.addReview(5);
        product.addReview(4);
        product.addReview(3);

        // Then
        assertEquals(12, product.getTotalReviewSumm());
        assertEquals(3, product.getReviewQuantity());
        assertEquals(4.0, product.getAverageRating(), 0.01);
    }

    @Test
    @DisplayName("Should throw exception for invalid review grade")
    void testAddReview_InvalidGrade() {
        // Then
        assertThrows(IllegalArgumentException.class, () -> product.addReview(6));
        assertThrows(IllegalArgumentException.class, () -> product.addReview(0));
        assertThrows(IllegalArgumentException.class, () -> product.addReview(null));
    }

    @Test
    @DisplayName("Should calculate average rating correctly")
    void testGetAverageRating() {
        // Given
        product.addReview(5);
        product.addReview(4);
        product.addReview(3);
        product.addReview(2);
        product.addReview(1);

        // When
        Double average = product.getAverageRating();

        // Then
        assertEquals(3.0, average, 0.01);
    }

    @Test
    @DisplayName("Should return zero for average rating when no reviews")
    void testGetAverageRating_NoReviews() {
        // When
        Double average = product.getAverageRating();

        // Then
        assertEquals(0.0, average, 0.01);
    }

    @Test
    @DisplayName("Should calculate volume weight correctly")
    void testGetVolumeWeight() {
        // Given
        product.setLengthCm(10.0f);
        product.setWidthCm(20.0f);
        product.setHeightCm(30.0f);

        // When
        Float volumeWeight = product.getVolumeWeight();

        // Then
        assertEquals(1.2f, volumeWeight, 0.01f); // (10 * 20 * 30) / 5000 = 1.2
    }

    @Test
    @DisplayName("Should return null for volume weight when dimensions missing")
    void testGetVolumeWeight_MissingDimensions() {
        // When
        Float volumeWeight = product.getVolumeWeight();

        // Then
        assertNull(volumeWeight);
    }

    @Test
    @DisplayName("Should calculate chargeable weight as max of actual and volume weight")
    void testGetChargeableWeight() {
        // Given
        product.setWeightKg(0.5f);
        product.setLengthCm(10.0f);
        product.setWidthCm(20.0f);
        product.setHeightCm(30.0f); // Volume weight = 1.2

        // When
        Float chargeableWeight = product.getChargeableWeight();

        // Then
        assertEquals(1.2f, chargeableWeight, 0.01f); // Max of 0.5 and 1.2
    }

    @Test
    @DisplayName("Should use actual weight when greater than volume weight")
    void testGetChargeableWeight_ActualWeightGreater() {
        // Given
        product.setWeightKg(2.0f);
        product.setLengthCm(10.0f);
        product.setWidthCm(20.0f);
        product.setHeightCm(30.0f); // Volume weight = 1.2

        // When
        Float chargeableWeight = product.getChargeableWeight();

        // Then
        assertEquals(2.0f, chargeableWeight, 0.01f); // Max of 2.0 and 1.2
    }

    @Test
    @DisplayName("Should handle null weight values")
    void testGetChargeableWeight_NullWeight() {
        // Given
        product.setWeightKg(null);
        product.setLengthCm(10.0f);
        product.setWidthCm(20.0f);
        product.setHeightCm(30.0f);

        // When
        Float chargeableWeight = product.getChargeableWeight();

        // Then
        assertEquals(1.2f, chargeableWeight, 0.01f); // Should use volume weight
    }
}








