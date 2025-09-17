package com.example.demo.Entities;

import com.example.demo.Entities.QuestProgress;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
public class User {
    @Id
    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = true)
    private String phone;

    @Column(nullable = true)
    private String company;

    @Column(nullable = false)
    private String role;

    @Column(nullable = true)
    private String referralCode;

    @Column(nullable = false)
    private Integer referralCount = 0;

    @Column(nullable = false)
    private Float discountPercent = 0.0f;

    @Column(nullable = false)
    private Float temporaryDiscountPercent = 0.0f;

    @Column(nullable = true)
    private LocalDateTime temporaryDiscountExpired;

    @Column(nullable = true)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Float balance = 0.0f;

    @Column(nullable = true)
    private Double moneySpent;

    @Column(nullable = false)
    private Boolean notificationsEnabled = false;

    @Column(nullable = false)
    private Boolean twoFactorEnabled = false;

    @Column(nullable = true)
    private String avatarUrl;

    @Column(nullable = false)
    private Boolean emailVerified = false;

    @Column(nullable = false)
    private Boolean phoneVerified = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    private User referredBy;

    @OneToMany(mappedBy = "referredBy", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<User> referrals = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<QuestProgress> questProgresses = new ArrayList<>();

    public User() {}

    public void verifyDiscount() {
        if (temporaryDiscountExpired != null && temporaryDiscountExpired.isBefore(LocalDateTime.now())) {
            this.temporaryDiscountPercent = 0.0f;
            this.temporaryDiscountExpired = null;
        }
    }

    public void addDiscountPercent(float discountPercent) {
        this.discountPercent = Math.min((this.discountPercent + discountPercent), 20.0f);
    }

    public void addTemporaryDiscountPercent(float discountPercent) {
        this.temporaryDiscountPercent = Math.min((this.temporaryDiscountPercent + discountPercent), 80.0f);
        if (this.temporaryDiscountExpired == null) {
            this.temporaryDiscountExpired = LocalDateTime.now().plusMonths(2);
        }
    }

    public float getTotalDiscount() {
        verifyDiscount();
        return this.discountPercent + this.temporaryDiscountPercent;
    }

    public void incrementReferralCount() {
        this.referralCount = this.referralCount == null ? 1 : this.referralCount + 1;
    }
}