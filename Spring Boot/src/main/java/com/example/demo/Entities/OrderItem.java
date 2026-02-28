package com.example.demo.Entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * OrderItem entity representing a single product item within an order.
 * Enhanced with China-specific tracking and purchase status information.
 */
@Entity
@Table(name = "order_items", indexes = {
        @Index(name = "idx_order_id", columnList = "order_id"),
        @Index(name = "idx_product_id", columnList = "product_id"),
        @Index(name = "idx_purchase_status", columnList = "purchase_status")
})
@Data
@EqualsAndHashCode(exclude = {"order", "product"})
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @NotNull(message = "Order is required")
    private Order order;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = true)
    private Product product; // Nullable for self-pickup orders where product is unknown

    @Column(name = "quantity", nullable = false)
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @Column(name = "price_at_time", nullable = false)
    @NotNull(message = "Price at time of order is required")
    @Min(value = 0, message = "Price must be non-negative")
    private Float priceAtTime; // Price snapshot at order time

    @Column(name = "supplier_price")
    @Min(value = 0, message = "Supplier price must be non-negative")
    private Float supplierPrice; // Actual price paid to supplier in China

    // Tracking information
    @Column(name = "tracking_number", length = 100)
    @Size(max = 100, message = "Tracking number must not exceed 100 characters")
    private String trackingNumber; // Individual item tracking

    @Column(name = "china_tracking_number", length = 100)
    @Size(max = 100, message = "China tracking number must not exceed 100 characters")
    private String chinaTrackingNumber; // Tracking from China supplier

    // Purchase status and management
    @Column(name = "purchase_status", nullable = false, length = 50)
    @NotNull(message = "Purchase status is required")
    private String purchaseStatus = "PENDING"; // PURCHASED, NOT_PURCHASED, PENDING, REFUNDED

    @Column(name = "purchase_refusal_reason", columnDefinition = "TEXT")
    private String purchaseRefusalReason;

    @Column(name = "purchased_date")
    private java.sql.Timestamp purchasedDate; // When item was purchased from supplier

    // Shipping costs specific to this item
    @Column(name = "china_delivery_price")
    @Min(value = 0, message = "China delivery price must be non-negative")
    private Float chinaDeliveryPrice; // Delivery cost from supplier to warehouse

    @Column(name = "item_weight")
    @Min(value = 0, message = "Item weight must be non-negative")
    private Float itemWeight; // Weight of this specific item (quantity * product weight)

    @Column(name = "item_customs_value")
    @Min(value = 0, message = "Item customs value must be non-negative")
    private Float itemCustomsValue; // Declared value for customs for this item

    /**
     * Calculates total price for this item (quantity * price at time).
     * @return total price for this item
     */
    public Float getTotalPrice() {
        if (quantity == null || priceAtTime == null) {
            return 0.0f;
        }
        return quantity * priceAtTime;
    }

    /**
     * Calculates total supplier cost for this item.
     * @return total supplier cost or null if not available
     */
    public Float getTotalSupplierCost() {
        if (quantity == null || supplierPrice == null) {
            return null;
        }
        return quantity * supplierPrice;
    }

    /**
     * Checks if item has been purchased from supplier.
     * @return true if purchase status is PURCHASED
     */
    public boolean isPurchased() {
        return "PURCHASED".equalsIgnoreCase(purchaseStatus);
    }

    /**
     * Checks if item purchase was refused.
     * @return true if purchase status is NOT_PURCHASED
     */
    public boolean isPurchaseRefused() {
        return "NOT_PURCHASED".equalsIgnoreCase(purchaseStatus);
    }
}