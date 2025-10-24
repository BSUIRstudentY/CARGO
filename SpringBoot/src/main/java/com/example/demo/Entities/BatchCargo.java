package com.example.demo.Entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "batch_cargos")
@Getter
@Setter
public class BatchCargo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Timestamp creationDate;

    @Column(nullable = false)
    private Timestamp purchaseDate;

    @Column(nullable = false)
    private String status; // UNFINISHED, FINISHED, REFUSED

    @Column(name = "reason_refusal")
    private String reasonRefusal; // Reason for refusal, nullable

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_email", nullable = false)
    private Supplier supplier; // Обратная связь с Supplier

    @OneToMany(mappedBy = "batchCargo")
    private List<Order> orders;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Конструктор по умолчанию
    public BatchCargo() {}
}