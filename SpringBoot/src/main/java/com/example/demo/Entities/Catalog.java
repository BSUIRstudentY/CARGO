package com.example.demo.Entities;

import jakarta.persistence.*;
import lombok.Data;
import java.sql.Timestamp;

@Entity
@Table(name = "catalog")
@Data
public class Catalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Свой ID для каталога

    @OneToOne(fetch = FetchType.LAZY) // Или @ManyToOne, если один продукт может быть в нескольких каталогах
    @JoinColumn(name = "product_id", nullable = false)
    private Product product; // Ссылка на продукт


}