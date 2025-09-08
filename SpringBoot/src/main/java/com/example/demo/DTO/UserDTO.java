package com.example.demo.DTO;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.example.demo.Components.LocalDateTimeArraySerializer;

import java.time.LocalDateTime;

public class UserDTO {
    private String email;
    private String username;
    private String phone;
    private String company;
    private Float totalDiscount;
    private Float discountPercent;
    private Float temporaryDiscountPercent;
    @JsonSerialize(using = LocalDateTimeArraySerializer.class)
    private LocalDateTime temporaryDiscountExpired;
    private String referralCode;
    private Boolean notificationsEnabled;
    private Boolean twoFactorEnabled;
    private String avatarUrl;
    private Boolean emailVerified;
    private Boolean phoneVerified;
    private String role;
    private Float balance;
    private Integer referralCount;
    private Double moneySpent;

    public Double getMoneySpent() {
        return moneySpent;
    }

    public void setMoneySpent(Double moneySpent) {
        this.moneySpent = moneySpent;
    }

    // Getters and setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public Float getTotalDiscount() { return totalDiscount; }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Float getBalance() {
        return balance;
    }

    public void setBalance(Float balance) {
        this.balance = balance;
    }

    public Integer getReferralCount() {
        return referralCount;
    }

    public void setReferralCount(Integer referralCount) {
        this.referralCount = referralCount;
    }

    public void setTotalDiscount(Float totalDiscount) { this.totalDiscount = totalDiscount; }
    public Float getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Float discountPercent) { this.discountPercent = discountPercent; }
    public Float getTemporaryDiscountPercent() { return temporaryDiscountPercent; }
    public void setTemporaryDiscountPercent(Float temporaryDiscountPercent) { this.temporaryDiscountPercent = temporaryDiscountPercent; }
    public LocalDateTime getTemporaryDiscountExpired() { return temporaryDiscountExpired; }
    public void setTemporaryDiscountExpired(LocalDateTime temporaryDiscountExpired) { this.temporaryDiscountExpired = temporaryDiscountExpired; }
    public String getReferralCode() { return referralCode; }
    public void setReferralCode(String referralCode) { this.referralCode = referralCode; }
    public Boolean getNotificationsEnabled() { return notificationsEnabled; }
    public void setNotificationsEnabled(Boolean notificationsEnabled) { this.notificationsEnabled = notificationsEnabled; }
    public Boolean getTwoFactorEnabled() { return twoFactorEnabled; }
    public void setTwoFactorEnabled(Boolean twoFactorEnabled) { this.twoFactorEnabled = twoFactorEnabled; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }
    public Boolean getPhoneVerified() { return phoneVerified; }
    public void setPhoneVerified(Boolean phoneVerified) { this.phoneVerified = phoneVerified; }
}