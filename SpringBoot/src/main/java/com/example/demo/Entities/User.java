package com.example.demo.Entities;

import com.example.demo.Entities.QuestProgress;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
public class User implements UserDetails {  // Добавлено: implements UserDetails
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

    @Column(name = "telegram")
    private String telegramUserId;

    @Column(nullable = false)
    private Boolean telegramVerified = false;

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

    // Реализация UserDetails методов (новое)
    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // На основе поля role (String) — добавляем префикс "ROLE_" (стандарт Spring)
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;  // Username = email (как в вашем JWT)
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;  // Можно добавить логику (e.g., по дате createdAt)
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;  // Логика блокировки аккаунта
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;  // Срок действия пароля
    }

    @Override
    public boolean isEnabled() {
        return emailVerified;  // Или true, если verified не влияет
    }

    // Ваши существующие методы (без изменений)
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