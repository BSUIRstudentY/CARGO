package com.example.demo.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "order_history")
@Data
public class OrderHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_email", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "order_number", nullable = false)
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promocode_id")
    @JsonIgnore
    private Promocode promocode;

    @OneToMany(mappedBy = "orderHistory", cascade = CascadeType.ALL, orphanRemoval = true)
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
}