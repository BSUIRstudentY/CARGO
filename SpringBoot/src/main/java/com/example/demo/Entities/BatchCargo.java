package com.example.demo.Entities;

import jakarta.persistence.*;
import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "batch_cargos")
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

    @OneToMany(mappedBy = "batchCargo")
    private List<Order> orders;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    public String getDescription(){
        return this.description;
    }

    public void setDescription(String description){
        this.description = description;
    }

    public String getPhotoUrl(){
        return this.photoUrl;
    }

    public void setPhotoUrl(String photoUrl){
        this.photoUrl = photoUrl;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Timestamp getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(Timestamp creationDate) {
        this.creationDate = creationDate;
    }

    public Timestamp getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(Timestamp purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReasonRefusal() {
        return reasonRefusal;
    }

    public void setReasonRefusal(String reasonRefusal) {
        this.reasonRefusal = reasonRefusal;
    }

    public List<Order> getOrders() {
        return orders;
    }

    public void setOrders(List<Order> orders) {
        this.orders = orders;
    }
}