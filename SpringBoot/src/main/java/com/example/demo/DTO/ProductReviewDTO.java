package com.example.demo.DTO;

import lombok.Data;

import java.sql.Timestamp;

@Data
public class ProductReviewDTO {
    private Long id;
    private String productId;
    private String userEmail;
    private String username; // Для отображения имени пользователя
    private String comment;
    private Integer rating;
    private Timestamp createdAt;
}