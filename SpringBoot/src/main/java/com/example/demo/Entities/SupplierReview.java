package com.example.demo.Entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "supplier_reviews")
@Getter
@Setter
public class SupplierReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_email", nullable = false)
    private User user;

    @Column(nullable = false)
    private Float rating; // Оценка (например, от 1 до 5)

    @Column(nullable = true, columnDefinition = "TEXT")
    private String comment; // Комментарий к отзыву

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now(); // Время создания отзыва
}