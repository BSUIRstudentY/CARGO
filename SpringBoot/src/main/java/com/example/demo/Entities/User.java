package com.example.demo.Entities;

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
    @Column(nullable = false)
    private String username;

    @Id
    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;

    @Column(nullable = true)
    private String referralCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    private User referredBy;

    @OneToMany(mappedBy = "referredBy", fetch = FetchType.LAZY)
    private List<User> referrals = new ArrayList<>();

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

    @Column(nullable = true)
    private Double moneySpent;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<QuestProgress> questProgresses = new ArrayList<>();

    @Column(nullable = false)
    private Float balance = 0.0f;

    public User() {}

    public void verifyDiscount() {
        if (temporaryDiscountExpired == null) {
            temporaryDiscountExpired = LocalDateTime.now().plusMonths(2);
        }
        while (temporaryDiscountExpired.isBefore(LocalDateTime.now())) {
            temporaryDiscountExpired = temporaryDiscountExpired.plusMonths(2);
        }
    }

    public void addDiscountPercent(float discountPercent) {
        this.discountPercent = Math.min((this.discountPercent + discountPercent), 20.0f);
    }

    public void addTemporaryDiscountPercent(float discountPercent) {
        this.temporaryDiscountPercent = Math.min((this.temporaryDiscountPercent + discountPercent), 80.0f);
    }

    public float getTotalDiscount() {
        return this.discountPercent + this.temporaryDiscountPercent;
    }

    public void incrementReferralCount() {
        this.referralCount = this.referralCount == null ? 1 : this.referralCount + 1;
    }
}