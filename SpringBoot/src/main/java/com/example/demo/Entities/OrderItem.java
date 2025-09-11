package com.example.demo.Entities;

import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "order_history_id")
    private OrderHistory orderHistory;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Column
    private Integer quantity;

    @Column(name = "price_at_time")
    private Float priceAtTime;

    @Column(name = "supplier_price")
    private Float supplierPrice;

    @Column(name = "purchase_status")
    private String purchaseStatus = "PENDING"; // Default value // PENDING, PURCHASED, NOT_PURCHASED

    @Column(name = "purchase_refusal_reason")
    private String purchaseRefusalReason; // Reason for NOT_PURCHASED

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public OrderHistory getOrderHistory() {
        return orderHistory;
    }

    public void setOrderHistory(OrderHistory orderHistory) {
        this.orderHistory = orderHistory;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Float getPriceAtTime() {
        return priceAtTime;
    }

    public void setPriceAtTime(Float priceAtTime) {
        this.priceAtTime = priceAtTime;
    }

    public Float getSupplierPrice() {
        return supplierPrice;
    }

    public void setSupplierPrice(Float supplierPrice) {
        this.supplierPrice = supplierPrice;
    }

    public String getPurchaseStatus() {
        return purchaseStatus;
    }

    public void setPurchaseStatus(String purchaseStatus) {
        this.purchaseStatus = purchaseStatus;
    }

    public String getPurchaseRefusalReason() {
        return purchaseRefusalReason;
    }

    public void setPurchaseRefusalReason(String purchaseRefusalReason) {
        this.purchaseRefusalReason = purchaseRefusalReason;
    }
}