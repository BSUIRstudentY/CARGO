package com.example.demo.Entities;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;

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

    @Column(length = 2048)
    private String url; // ссылка на товар

    private Float price; // цена

    @Column(length = 2048)
    private String imageUrl; // фото товара
    private String status;
    private Integer salesCount; // Добавьте, если еще нет
    private Integer cluster;    // Новое поле для кластера

    @Column(length = 1000)
    private String description; // описание

    private Timestamp lastUpdated; // последнее обновление товара
}