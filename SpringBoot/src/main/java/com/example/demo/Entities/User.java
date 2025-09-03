package com.example.demo.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
public class User {
    private String username;

    @Id
    private String email;

    private String password;
    private String role;

    private String referralCode;
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    private User referredBy; // Ссылка на реферера
    @OneToMany(mappedBy = "referredBy", fetch = FetchType.LAZY)
    private List<User> referrals = new ArrayList<>(); // Список рефералов
    private Integer referralCount = 0;

    private Float discountPercent = 0.0f; // Постоянная скидка
    private Float temporaryDiscountPercent = 0.0f; // Временная скидка
    private LocalDateTime temporaryDiscountExpired; // Дата окончания временной скидки
    private LocalDateTime createdAt;
    private Double moneySpent;
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<QuestProgress> questProgresses = new ArrayList<>();
    public User() {}


    // проверить временную скидку на срок годности
    public void verifyDiscount()
    {
        if(temporaryDiscountExpired == null)
        {
            temporaryDiscountExpired = LocalDateTime.now().plusMonths(2);

        }
        while(temporaryDiscountExpired.isBefore(LocalDateTime.now()))
        {
            temporaryDiscountExpired = temporaryDiscountExpired.plusMonths(2);
        }

    }

    // добавить постоянную скидку
    public void addDiscountPercent(float discountPercent)
    {
        this.discountPercent =  Math.min((this.discountPercent + discountPercent), 20.0f);
    }

    // добавить временную скидку
    public void addTemporaryDiscountPercent(float discountPercent)
    {
        this.temporaryDiscountPercent = Math.min( (this.temporaryDiscountPercent + discountPercent), 80.0f);
    }

    public float getTotalDiscount()
    {
        return this.discountPercent + this.temporaryDiscountPercent;
    }


    public void incrementReferralCount()
    {
        this.referralCount = this.referralCount == null ? 1 : this.referralCount+1;

    }


}
