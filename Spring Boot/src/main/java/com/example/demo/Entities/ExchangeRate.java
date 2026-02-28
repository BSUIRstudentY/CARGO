package com.example.demo.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.sql.Timestamp;

/**
 * ExchangeRate entity representing shipping rate (USD per kg) for cargo delivery from China.
 * This rate is used to calculate shipping costs based on weight.
 */
@Entity
@Table(name = "exchange_rate", indexes = {
        @Index(name = "idx_rate_type", columnList = "rateType"),
        @Index(name = "idx_is_active", columnList = "isActive")
})
@Data
public class ExchangeRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rate_type", length = 50, nullable = false)
    @NotNull(message = "Rate type is required")
    private String rateType = "SHIPPING_USD_PER_KG"; // Type of rate (e.g., SHIPPING_USD_PER_KG)

    @Column(name = "rate_value", nullable = false)
    @NotNull(message = "Rate value is required")
    @Min(value = 0, message = "Rate value must be non-negative")
    private Double rateValue; // Rate value (e.g., 6.0 for $6 per kg)

    @Column(name = "currency_from", length = 10, nullable = false)
    @NotNull(message = "Currency from is required")
    private String currencyFrom = "USD"; // Source currency

    @Column(name = "currency_to", length = 10)
    private String currencyTo; // Target currency (if applicable)

    @Column(name = "unit", length = 20, nullable = false)
    @NotNull(message = "Unit is required")
    private String unit = "KG"; // Unit of measurement (KG for kilograms)

    @Column(name = "is_active", nullable = false)
    @NotNull(message = "Is active flag is required")
    private Boolean isActive = true; // Whether this rate is currently active

    @Column(name = "description", length = 500)
    private String description; // Description of the rate

    @Column(name = "created_at", nullable = false, updatable = false)
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());

    @Column(name = "updated_at", nullable = false)
    private Timestamp updatedAt = new Timestamp(System.currentTimeMillis());

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Timestamp(System.currentTimeMillis());
    }
}




