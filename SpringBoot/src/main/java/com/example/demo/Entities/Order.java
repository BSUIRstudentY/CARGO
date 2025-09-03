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
    @JsonIgnore
    private User user;

    @Column(name = "order_number", nullable = false, unique = true)
    private String orderNumber;

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
    private Float discountApplied; // Total discount (promocode only)

    @Column(name = "user_discount_applied", nullable = true)
    private Float userDiscountApplied; // User-specific discount (discountPercent + temporaryDiscountPercent)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promocode_id")
    @JsonIgnore
    private Promocode promocode;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<OrderItem> items;

    @Column(name = "insurance_cost", nullable = true)
    private Float insuranceCost;
}