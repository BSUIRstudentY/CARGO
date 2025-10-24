package com.example.demo.Entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
public class Supplier {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role = "CARGO"; // Роль: CARGO

    @Column(nullable = false, unique = true)
    private String companyName;

    @Column(nullable = true, length = 65535, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = true)
    private String websiteUrl;

    @Column(nullable = false)
    private Float rating = 0.0f;

    @Column(nullable = false)
    private Integer reviewCount = 0;

    @Column(nullable = true)
    private String licenseNumber;

    @Column(nullable = true)
    private String address;

    @Column(nullable = false)
    private Boolean isVerified = false;

    @Column(nullable = true)
    private Float baseShippingCost;

    @Column(nullable = true)
    private Integer estimatedDeliveryDays;

    @Column(nullable = true)
    private LocalDateTime lastActivity;

    @Column(nullable = true)
    private LocalDateTime createdAt;

    @Column(nullable = true)
    private String referralCode;

    @Column(nullable = false)
    private Integer referralCount = 0;

    @Column(nullable = true)
    private Double moneySpent;

    @OneToMany(mappedBy = "supplier", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<BatchCargo> batchCargos = new ArrayList<>();

    @OneToMany(mappedBy = "supplier", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<SupplierReview> reviews = new ArrayList<>();

    public Supplier() {}

    public void addReview(Float rating) {
        this.reviewCount = this.reviewCount == null ? 1 : this.reviewCount + 1;
        this.rating = ((this.rating * (this.reviewCount - 1)) + rating) / this.reviewCount;
    }

    public void verifySupplier() {
        this.isVerified = true;
    }
}