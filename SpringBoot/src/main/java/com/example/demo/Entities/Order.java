package com.example.demo.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_email", nullable = false)
    private User user;

    @Column(name = "order_number", nullable = false, unique = true)
    private String orderNumber;

    @Column(name = "reasonRefusal", nullable = true)
    private String reasonRefusal;

    @Column(name = "date_created", nullable = false)
    private Timestamp dateCreated;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "total_client_price", nullable = false)
    private Float totalClientPrice;

    @Column(name = "supplier_cost", nullable = true)
    private Float supplierCost;

    @Column(name = "customs_duty", nullable = true)
    private Float customsDuty;

    @Column(name = "shipping_cost", nullable = true)
    private Float shippingCost;

    @Column(name = "delivery_address", length = 500)
    private String deliveryAddress;

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    @Column(name = "discount_applied", nullable = true)
    private Float discountApplied;

    @Column(name = "user_discount_applied", nullable = true)
    private Float userDiscountApplied;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promocode_id")
    @JsonIgnore
    private Promocode promocode;

    @ManyToOne
    @JoinColumn(name = "batch_cargo_id")
    private BatchCargo batchCargo;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<OrderItem> items;

    @Column(name = "insurance_cost", nullable = true)
    private Float insuranceCost;

    @Column(name = "insurance", nullable = true)
    private Boolean insurance;

    @Column(name = "discount_type", nullable = true)
    private String discountType;

    @Column(name = "discount_value", nullable = true)
    private Float discountValue;

    @Column(name = "weight", nullable = true)
    private Float weight;

    @Override
    public String toString() {
        return "Order{" +
                "id=" + id +
                ", user=" + user +
                ", orderNumber='" + orderNumber + '\'' +
                ", reasonRefusal='" + reasonRefusal + '\'' +
                ", dateCreated=" + dateCreated +
                ", status='" + status + '\'' +
                ", totalClientPrice=" + totalClientPrice +
                ", supplierCost=" + supplierCost +
                ", customsDuty=" + customsDuty +
                ", shippingCost=" + shippingCost +
                ", deliveryAddress='" + deliveryAddress + '\'' +
                ", trackingNumber='" + trackingNumber + '\'' +
                ", discountApplied=" + discountApplied +
                ", userDiscountApplied=" + userDiscountApplied +
                ", promocode=" + promocode +
                ", batchCargo=" + batchCargo +
                ", items=" + items +
                ", insuranceCost=" + insuranceCost +
                ", insurance=" + insurance +
                ", discountType='" + discountType + '\'' +
                ", discountValue=" + discountValue +
                ", weight=" + weight +
                '}';
    }
}