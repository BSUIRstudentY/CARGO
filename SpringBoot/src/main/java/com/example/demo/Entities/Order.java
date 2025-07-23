package com.example.demo.Entities;

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

    @Column(name = "date_created", nullable = false)
    private Timestamp dateCreated;

    @Column(name = "status", nullable = false)
    private String status; // Например, "Ожидает закупки", "Заказано в Китае"

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

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;
}