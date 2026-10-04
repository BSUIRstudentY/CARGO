package com.example.demo.Entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

/**
 * Product entity representing goods available for purchase from China.
 * Enhanced with fields specific to China delivery service: origin country, 
 * customs classification, weight, dimensions for shipping calculations.
 */
@Entity
@JsonIgnoreProperties(ignoreUnknown = true)
@Table(name = "product", indexes = {
        @Index(name = "idx_name", columnList = "name"),
        @Index(name = "idx_origin_country", columnList = "originCountry"),
        @Index(name = "idx_status", columnList = "status")
})
@Data
@EqualsAndHashCode(exclude = "reviews")
public class Product {

    @Id
    @Column(length = 36, nullable = false)
    @NotBlank(message = "Product ID is required")
    private String id;

    @Column(length = 255, nullable = false)
    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Product name must not exceed 255 characters")
    private String name;

    @Column(length = 65535, nullable = false)
    @NotBlank(message = "Product URL is required")
    private String url;

    @Column(nullable = false)
    @NotNull(message = "Product price is required")
    @Min(value = 0, message = "Price must be non-negative")
    private Float price;

    @Column(length = 65535)
    private String imageUrl;

    @Column(nullable = false, length = 50)
    @NotBlank(message = "Product status is required")
    private String status = "ACTIVE";

    @Column(name = "sales_count")
    @Min(value = 0, message = "Sales count must be non-negative")
    private Integer salesCount = 0;

    @Column(name = "cluster")
    private Integer cluster;

    @Column(length = 65535, columnDefinition = "TEXT")
    private String description;

    @Column(name = "last_updated", nullable = false, updatable = false)
    private Timestamp lastUpdated = new Timestamp(System.currentTimeMillis());

    // Review aggregation fields
    @Column(name = "total_review_sum", nullable = false)
    private Integer totalReviewSumm = 0;

    @Column(name = "review_quantity", nullable = false)
    private Integer reviewQuantity = 0;

    // China delivery specific fields
    @Column(name = "origin_country", length = 100, nullable = false)
    @NotBlank(message = "Origin country is required")
    private String originCountry = "China"; // Default to China for delivery service

    @Column(name = "customs_code", length = 50)
    @Size(max = 50, message = "Customs code must not exceed 50 characters")
    private String customsCode; // HS code for customs classification

    @Column(name = "weight_kg")
    @Min(value = 0, message = "Weight must be non-negative")
    private Float weightKg; // Weight in kilograms for shipping calculation

    @Column(name = "length_cm")
    @Min(value = 0, message = "Length must be non-negative")
    private Float lengthCm; // Dimensions for shipping

    @Column(name = "width_cm")
    @Min(value = 0, message = "Width must be non-negative")
    private Float widthCm;

    @Column(name = "height_cm")
    @Min(value = 0, message = "Height must be non-negative")
    private Float heightCm;

    @Column(name = "supplier_name", length = 255)
    private String supplierName; // Supplier information in China

    @Column(name = "supplier_contact", length = 255)
    private String supplierContact;

    @Column(name = "estimated_delivery_days")
    @Min(value = 0, message = "Estimated delivery days must be non-negative")
    private Integer estimatedDeliveryDays; // Estimated days from China

    // Relationships
    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductReview> reviews = new ArrayList<>();

    /**
     * Adds a review rating and updates aggregated review statistics.
     * Thread-safe calculation of average rating.
     */
    public void addReview(Integer grade) {
        if (grade == null || grade < 1 || grade > 5) {
            throw new IllegalArgumentException("Review grade must be between 1 and 5");
        }
        
        synchronized (this) {
            if (totalReviewSumm == null) {
                totalReviewSumm = grade;
                reviewQuantity = 1;
            } else {
                totalReviewSumm += grade;
                reviewQuantity++;
            }
        }
    }

    /**
     * Calculates the average rating from reviews.
     * @return average rating or 0.0 if no reviews
     */
    public Double getAverageRating() {
        if (reviewQuantity == null || reviewQuantity == 0 || totalReviewSumm == null) {
            return 0.0;
        }
        return (double) totalReviewSumm / reviewQuantity;
    }

    /**
     * Calculates volume weight for shipping (used by carriers).
     * Formula: (length × width × height) / 5000 (standard for China shipping)
     * @return volume weight in kg
     */
    public Float getVolumeWeight() {
        if (lengthCm == null || widthCm == null || heightCm == null) {
            return null;
        }
        return (lengthCm * widthCm * heightCm) / 5000.0f;
    }

    /**
     * Gets the chargeable weight (max of actual weight and volume weight).
     * @return chargeable weight in kg
     */
    public Float getChargeableWeight() {
        Float actualWeight = weightKg != null ? weightKg : 0.0f;
        Float volWeight = getVolumeWeight();
        if (volWeight == null) {
            return actualWeight;
        }
        return Math.max(actualWeight, volWeight);
    }
}