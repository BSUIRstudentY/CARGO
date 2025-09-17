package com.example.demo.Entities;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(indexes = {
        @Index(name = "idx_name", columnList = "name") // Индекс на поле name
})
@Data
public class Product {

    @Id
    @Column(length = 36) // Длина UUID (например, 550e8400-e29b-41d4-a716-446655440000)
    private String id; // id, генерируется на клиенте

    @Column(length = 255)
    private String name; // название

    @Column(length = 65535)  // Увеличьте до 16К (или больше, если нужно; max для VARCHAR — 65 535)
    private String url; // ссылка на товар

    private Float price; // цена

    @Column(length = 65535)  // Увеличьте до 16К (или больше, если нужно; max для VARCHAR — 65 535)
    private String imageUrl; // фото товара
    private String status;
    private Integer salesCount; // Добавьте, если еще нет
    private Integer cluster;    // Новое поле для кластера

    @Column(length = 65535)
    private String description; // описание

    private Timestamp lastUpdated; // последнее обновление товара


    private Integer totalReviewSumm = 0;
    private Integer reviewQuantity = 0;


    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<ProductReview> reviews = new ArrayList<>(); // Связь с отзывами


    public void addReview(Integer grade)
    {
        if(totalReviewSumm == null)
        {
            totalReviewSumm = grade;
            reviewQuantity = 1;

        }
        else
        {

            totalReviewSumm+= grade;
            ++reviewQuantity;
        }

    }
}