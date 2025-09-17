
package com.example.demo.Entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "order_items")
@Data
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_history_id")
    private OrderHistory orderHistory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "price_at_time", nullable = false)
    private Float priceAtTime;

    @Column(name = "supplier_price")
    private Float supplierPrice;

    @Column(name = "tracking_number")
    private String trackingNumber;

    @Column(name = "purchase_status", nullable = false)
    private String purchaseStatus = "PENDING"; // PURCHASED, NOT_PURCHASED, PENDING

    @Column(name = "purchase_refusal_reason")
    private String purchaseRefusalReason;
}