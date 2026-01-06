package com.example.demo.Entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "carts")
@Data
public class Cart {

    @Id
    private String userEmail;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // Manage serialization of items
    private List<CartItem> items = new ArrayList<>();
}