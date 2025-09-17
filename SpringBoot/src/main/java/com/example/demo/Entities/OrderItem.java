package com.example.demo.Entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.bind.DefaultValue;

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

    private Float chinaDeliveryPrice;

    @Column(name = "supplier_price", nullable = true)
    private Float supplierPrice;

    @Column(name = "tracking_number")
    private String trackingNumber;


    // Getter and Setter for purchaseStatus
    @Setter
    @Getter
    @Column(nullable = false)
    private String purchaseStatus = "PENDING"; // PURCHASED, NOT_PURCHASED, PENDING

    @Column
    private String purchaseRefusalReason; // New field for refusal reason


}