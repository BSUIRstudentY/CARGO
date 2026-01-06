package com.example.demo.Entities;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name= "Transaction")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Id;



    // Поле Order с ManyToOne (связь + FK)
    @ManyToOne(fetch = FetchType.LAZY)  // Lazy: не загружай Order сразу
    @JoinColumn(name = "order_id", nullable = false)  // FK-колонка в Transaction
    private Order order;


    // Поле для даты создания (самая свежая = max createdAt)
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

}
