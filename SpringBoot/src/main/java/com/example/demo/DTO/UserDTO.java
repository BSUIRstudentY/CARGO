package com.example.demo.DTO;

import com.example.demo.Components.LocalDateTimeArraySerializer;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import java.time.LocalDateTime;

public class UserDTO {
    private String email;
    private String username;
    private Float totalDiscount;
    private Float discountPercent;
    private Float temporaryDiscountPercent;
    @JsonSerialize(using = LocalDateTimeArraySerializer.class)
    private LocalDateTime temporaryDiscountExpired;

    // Getters and setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public Float getTotalDiscount() { return totalDiscount; }
    public void setTotalDiscount(Float totalDiscount) { this.totalDiscount = totalDiscount; }
    public Float getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Float discountPercent) { this.discountPercent = discountPercent; }
    public Float getTemporaryDiscountPercent() { return temporaryDiscountPercent; }
    public void setTemporaryDiscountPercent(Float temporaryDiscountPercent) { this.temporaryDiscountPercent = temporaryDiscountPercent; }
    public LocalDateTime getTemporaryDiscountExpired() { return temporaryDiscountExpired; }
    public void setTemporaryDiscountExpired(LocalDateTime temporaryDiscountExpired) { this.temporaryDiscountExpired = temporaryDiscountExpired; }
}