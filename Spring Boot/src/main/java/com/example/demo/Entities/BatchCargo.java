package com.example.demo.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

/**
 * BatchCargo entity representing a batch shipment from China.
 * Groups multiple orders together for consolidated shipping and customs processing.
 * Enhanced with comprehensive tracking and logistics information.
 */
@Entity
@Table(name = "batch_cargos", indexes = {
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_creation_date", columnList = "creationDate"),
        @Index(name = "idx_batch_tracking", columnList = "batchTrackingNumber")
})
@Data
@EqualsAndHashCode(exclude = "orders")
public class BatchCargo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "creation_date", nullable = false, updatable = false)
    @NotNull(message = "Creation date is required")
    private Timestamp creationDate = new Timestamp(System.currentTimeMillis());

    @Column(name = "purchase_date", nullable = false)
    @NotNull(message = "Purchase date is required")
    private Timestamp purchaseDate;

    @Column(nullable = false, length = 50)
    @NotBlank(message = "Status is required")
    private String status = "UNFINISHED"; // UNFINISHED, FINISHED, REFUSED, IN_TRANSIT, AT_CUSTOMS, DELIVERED

    @Column(name = "reason_refusal", columnDefinition = "TEXT")
    private String reasonRefusal;

    // Batch tracking and logistics
    @Column(name = "batch_tracking_number", length = 100, unique = true)
    @Size(max = 100, message = "Batch tracking number must not exceed 100 characters")
    private String batchTrackingNumber; // Master tracking for entire batch

    @Column(name = "china_warehouse_address", length = 500)
    @Size(max = 500, message = "Warehouse address must not exceed 500 characters")
    private String chinaWarehouseAddress; // Warehouse location in China

    @Column(name = "consolidation_warehouse", length = 255)
    @Size(max = 255, message = "Consolidation warehouse must not exceed 255 characters")
    private String consolidationWarehouse; // Warehouse name where batch is consolidated

    // Shipping information
    @Column(name = "shipping_method", length = 100)
    @Size(max = 100, message = "Shipping method must not exceed 100 characters")
    private String shippingMethod; // Air, Sea, Express, etc.

    @Column(name = "carrier_name", length = 100)
    @Size(max = 100, message = "Carrier name must not exceed 100 characters")
    private String carrierName; // Shipping carrier for batch

    @Column(name = "estimated_arrival_date")
    private Timestamp estimatedArrivalDate; // Estimated arrival at destination country

    @Column(name = "actual_arrival_date")
    private Timestamp actualArrivalDate; // Actual arrival date

    // Customs and documentation
    @Column(name = "customs_declaration_number", length = 100)
    @Size(max = 100, message = "Customs declaration number must not exceed 100 characters")
    private String customsDeclarationNumber; // Batch customs declaration

    @Column(name = "customs_status", length = 50)
    private String customsStatus; // PENDING, CLEARED, HELD, REJECTED

    @Column(name = "customs_clearance_date")
    private Timestamp customsClearanceDate;

    @Column(name = "total_batch_weight")
    private Float totalBatchWeight; // Total weight of batch in kg

    @Column(name = "total_batch_value")
    private Float totalBatchValue; // Total declared value for customs

    // Batch metadata
    @Column(name = "photo_url", length = 65535)
    private String photoUrl; // Photo of consolidated batch

    @Column(name = "description", columnDefinition = "TEXT")
    private String description; // Batch description/notes

    @Column(name = "item_count")
    private Integer itemCount; // Number of items in batch

    @Column(name = "order_count")
    private Integer orderCount; // Number of orders in batch

    // Relationships
    @OneToMany(mappedBy = "batchCargo", fetch = jakarta.persistence.FetchType.LAZY)
    private List<Order> orders = new ArrayList<>();

    /**
     * Calculates total number of orders in this batch.
     * @return order count
     */
    public int getTotalOrderCount() {
        return orders != null ? orders.size() : 0;
    }

    /**
     * Calculates total weight from all orders in batch.
     * @return total weight in kg
     */
    public Float calculateTotalWeight() {
        if (orders == null || orders.isEmpty()) {
            return totalBatchWeight != null ? totalBatchWeight : 0.0f;
        }
        return orders.stream()
                .filter(order -> order.getWeight() != null)
                .map(Order::getWeight)
                .reduce(0.0f, Float::sum);
    }

    /**
     * Checks if batch is in a terminal state.
     * @return true if batch is finished, refused, or delivered
     */
    public boolean isTerminalState() {
        return "FINISHED".equalsIgnoreCase(status) ||
               "REFUSED".equalsIgnoreCase(status) ||
               "DELIVERED".equalsIgnoreCase(status);
    }

    /**
     * Checks if batch can be modified.
     * @return true if batch can still be modified
     */
    public boolean canBeModified() {
        return "UNFINISHED".equalsIgnoreCase(status);
    }
}