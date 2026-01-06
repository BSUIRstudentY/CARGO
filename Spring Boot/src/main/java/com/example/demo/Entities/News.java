package com.example.demo.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.sql.Timestamp;

/**
 * News entity representing news, announcements, and batch cargo updates.
 * Used for displaying information about upcoming batch purchases, promotions, and general announcements.
 */
@Entity
@Table(name = "news", indexes = {
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_type", columnList = "type"),
        @Index(name = "idx_created_at", columnList = "createdAt"),
        @Index(name = "idx_published_at", columnList = "publishedAt")
})
@Data
public class News {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "Description is required")
    private String description;

    @Column(nullable = false, length = 50)
    @NotBlank(message = "Type is required")
    private String type; // batch, announcement, promotion, info

    @Column(nullable = false, length = 50)
    @NotBlank(message = "Status is required")
    private String status; // active, completed, info, promo, draft

    @Column(name = "image_url", length = 65535)
    private String imageUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    @NotNull(message = "Creation date is required")
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());

    @Column(name = "updated_at", nullable = false)
    @NotNull(message = "Update date is required")
    private Timestamp updatedAt = new Timestamp(System.currentTimeMillis());

    @Column(name = "published_at")
    private Timestamp publishedAt;

    @Column(name = "author_email", length = 255)
    @Size(max = 255, message = "Author email must not exceed 255 characters")
    private String authorEmail; // Email of admin who created the news

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Timestamp(System.currentTimeMillis());
    }

    /**
     * Checks if news is published (has publishedAt date).
     * @return true if published
     */
    public boolean isPublished() {
        return publishedAt != null && publishedAt.before(new Timestamp(System.currentTimeMillis()));
    }

    /**
     * Checks if news is active and visible to users.
     * @return true if active
     */
    public boolean isActive() {
        return "active".equalsIgnoreCase(status) || "info".equalsIgnoreCase(status) || "promo".equalsIgnoreCase(status);
    }
}

