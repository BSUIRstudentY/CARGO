package com.example.demo.Entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "promocodes")
@Data
public class Promocode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType; // PERCENTAGE или FIXED

    @Column(name = "discount_value", nullable = false)
    private Float discountValue; // Процент для PERCENTAGE, сумма для FIXED

    @Column(name = "valid_from", nullable = false)
    private LocalDateTime validFrom;

    @Column(name = "valid_until", nullable = false)
    private LocalDateTime validUntil;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "usage_limit")
    private Integer usageLimit; // null для бесконечных промокодов

    @Column(name = "used_count", nullable = false)
    private Integer usedCount = 0;

    @Column(name = "user_email")
    private String userEmail; // null для общих промокодов
}

