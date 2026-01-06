package com.example.demo.DTO;

import lombok.Data;

@Data
public class CartItemDTO {
    private Long id;
    private String imageUrl;
    private String productId;
    private String productName;
    private Float price;
    private Integer quantity;
}