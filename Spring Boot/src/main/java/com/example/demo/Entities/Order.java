package com.example.demo.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
 * Order entity representing a customer order for goods from China.
 * Enhanced with comprehensive tracking, customs, and shipping information
 * specific to international delivery from China.
 */
@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_order_number", columnList = "orderNumber"),
        @Index(name = "idx_user_email", columnList = "user_email"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_tracking_number", columnList = "trackingNumber"),
        @Index(name = "idx_date_created", columnList = "dateCreated")
})
@Data
@EqualsAndHashCode(exclude = {"user", "items", "promocode", "batchCargo"})
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_email", nullable = false)
    @NotNull(message = "User is required")
    private User user;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    @NotBlank(message = "Order number is required")
    @Size(max = 50, message = "Order number must not exceed 50 characters")
    private String orderNumber;

    @Column(name = "reason_refusal", columnDefinition = "TEXT")
    private String reasonRefusal;

    @Column(name = "date_created", nullable = false, updatable = false)
    @NotNull(message = "Creation date is required")
    private Timestamp dateCreated = new Timestamp(System.currentTimeMillis());

    @Column(name = "status", nullable = false, length = 50)
    @NotBlank(message = "Order status is required")
    private String status = "PENDING";

    // Pricing fields
    @Column(name = "total_client_price", nullable = false)
    @NotNull(message = "Total client price is required")
    @Min(value = 0, message = "Total price must be non-negative")
    private Float totalClientPrice;

    @Column(name = "supplier_cost")
    @Min(value = 0, message = "Supplier cost must be non-negative")
    private Float supplierCost;

    @Column(name = "customs_duty")
    @Min(value = 0, message = "Customs duty must be non-negative")
    private Float customsDuty;

    @Column(name = "shipping_cost")
    @Min(value = 0, message = "Shipping cost must be non-negative")
    private Float shippingCost;

    @Column(name = "insurance_cost")
    @Min(value = 0, message = "Insurance cost must be non-negative")
    private Float insuranceCost;

    @Column(name = "insurance")
    private Boolean insurance = false;

    // Payment fields
    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // BALANCE_ONLY, NO_BALANCE, BALANCE_PARTIAL

    @Column(name = "balance_amount")
    @Min(value = 0, message = "Balance amount must be non-negative")
    private Float balanceAmount; // Сумма, оплаченная с баланса

    // Discount fields
    @Column(name = "discount_applied")
    @Min(value = 0, message = "Discount must be non-negative")
    private Float discountApplied;

    @Column(name = "user_discount_applied")
    @Min(value = 0, message = "User discount must be non-negative")
    private Float userDiscountApplied;

    @Column(name = "discount_type", length = 50)
    private String discountType;

    @Column(name = "discount_value")
    @Min(value = 0, message = "Discount value must be non-negative")
    private Float discountValue;

    // Delivery and shipping fields
    @Column(name = "delivery_address", length = 500)
    @Size(max = 500, message = "Delivery address must not exceed 500 characters")
    private String deliveryAddress;

    @Column(name = "tracking_number", length = 100)
    @Size(max = 100, message = "Tracking number must not exceed 100 characters")
    private String trackingNumber;

    @Column(name = "china_tracking_number", length = 100)
    @Size(max = 100, message = "China tracking number must not exceed 100 characters")
    private String chinaTrackingNumber; // Tracking number from China carrier

    @Column(name = "international_tracking_number", length = 100)
    @Size(max = 100, message = "International tracking number must not exceed 100 characters")
    private String internationalTrackingNumber; // Tracking for international leg

    @Column(name = "local_tracking_number", length = 100)
    @Size(max = 100, message = "Local tracking number must not exceed 100 characters")
    private String localTrackingNumber; // Tracking for local delivery

    // Weight and dimensions
    @Column(name = "weight")
    @Min(value = 0, message = "Weight must be non-negative")
    private Float weight; // Total weight in kg

    @Column(name = "volume_weight")
    @Min(value = 0, message = "Volume weight must be non-negative")
    private Float volumeWeight; // Volume weight for shipping calculation

    @Column(name = "chargeable_weight")
    @Min(value = 0, message = "Chargeable weight must be non-negative")
    private Float chargeableWeight; // Max of actual and volume weight

    // Customs and documentation
    @Column(name = "customs_declaration_number", length = 100)
    @Size(max = 100, message = "Customs declaration number must not exceed 100 characters")
    private String customsDeclarationNumber; // Customs declaration reference

    @Column(name = "customs_status", length = 50)
    private String customsStatus; // PENDING, CLEARED, HELD, REJECTED

    @Column(name = "customs_clearance_date")
    private Timestamp customsClearanceDate;

    @Column(name = "customs_value")
    @Min(value = 0, message = "Customs value must be non-negative")
    private Float customsValue; // Declared value for customs

    // Shipping dates
    @Column(name = "shipped_from_china_date")
    private Timestamp shippedFromChinaDate;

    @Column(name = "arrived_at_customs_date")
    private Timestamp arrivedAtCustomsDate;

    @Column(name = "estimated_delivery_date")
    private Timestamp estimatedDeliveryDate;

    @Column(name = "actual_delivery_date")
    private Timestamp actualDeliveryDate;

    // Shipping carrier information
    @Column(name = "carrier_name", length = 100)
    @Size(max = 100, message = "Carrier name must not exceed 100 characters")
    private String carrierName; // Shipping carrier (e.g., EMS, DHL, China Post)

    @Column(name = "carrier_service", length = 100)
    @Size(max = 100, message = "Carrier service must not exceed 100 characters")
    private String carrierService; // Service type (e.g., Express, Standard)

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promocode_id")
    @JsonIgnore
    private Promocode promocode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_cargo_id")
    private BatchCargo batchCargo;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<OrderItem> items = new ArrayList<>();

    /**
     * Calculates total order weight from items.
     * @return total weight in kg
     */
    public Float calculateTotalWeight() {
        if (items == null || items.isEmpty()) {
            return weight != null ? weight : 0.0f;
        }
        return items.stream()
                .filter(item -> item.getProduct() != null && item.getProduct().getWeightKg() != null)
                .map(item -> item.getProduct().getWeightKg() * item.getQuantity())
                .reduce(0.0f, Float::sum);
    }

    /**
     * Checks if order is in a terminal state (completed, cancelled, refunded).
     * @return true if order is in terminal state
     */
    public boolean isTerminalState() {
        return "COMPLETED".equalsIgnoreCase(status) ||
               "CANCELLED".equalsIgnoreCase(status) ||
               "REFUNDED".equalsIgnoreCase(status);
    }

    /**
     * Checks if order can be cancelled.
     * @return true if order can be cancelled
     */
    public boolean canBeCancelled() {
        return !isTerminalState() && !"SHIPPED".equalsIgnoreCase(status) &&
               !"IN_TRANSIT".equalsIgnoreCase(status);
    }
}