package com.example.demo.Repositories;

import com.example.demo.Entities.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.QueryHint;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Product entities with optimized queries and caching.
 * Uses query hints for performance optimization and caching for frequently accessed data.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    
    @Override
    @QueryHints(@QueryHint(name = "org.hibernate.cacheable", value = "true"))
    Optional<Product> findById(String id);
    
    @Override
    boolean existsById(String id);
    
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    Page<Product> findAllByOrderByPriceAsc(Pageable pageable);
    
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    Page<Product> findAllByOrderByPriceDesc(Pageable pageable);
    
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    Page<Product> findAllByOrderBySalesCountDesc(Pageable pageable);
    
    /**
     * Finds similar products by name (for recommendations).
     * Uses parameterized query to prevent SQL injection.
     */
    @Query("SELECT p FROM Product p WHERE p.id != :id AND LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) AND p.status = 'ACTIVE'")
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    List<Product> findSimilarByName(@Param("id") String id, @Param("keyword") String keyword);
    
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    Page<Product> findByPriceBetween(Float minPrice, Float maxPrice, Pageable pageable);

    // Methods for filtering by status
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    Page<Product> findAllByStatus(String status, Pageable pageable);

    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    Page<Product> findByNameContainingIgnoreCaseAndStatus(String name, String status, Pageable pageable);

    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    Page<Product> findByPriceBetweenAndStatus(Float minPrice, Float maxPrice, String status, Pageable pageable);

    /**
     * Finds products by name, price range and status (combines all filters).
     */
    @Query("SELECT p FROM Product p WHERE " +
           "(:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "p.status = :status")
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    Page<Product> findByNameContainingIgnoreCaseAndPriceBetweenAndStatus(
            @Param("name") String name,
            @Param("minPrice") Float minPrice,
            @Param("maxPrice") Float maxPrice,
            @Param("status") String status,
            Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.id != :id AND LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) AND p.status = :status")
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    List<Product> findSimilarByNameAndStatus(@Param("id") String id, @Param("keyword") String keyword, @Param("status") String status);
    
    /**
     * Finds products by origin country (for China delivery service).
     */
    @Query("SELECT p FROM Product p WHERE p.originCountry = :country AND p.status = 'ACTIVE'")
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    Page<Product> findByOriginCountry(@Param("country") String country, Pageable pageable);
    
    /**
     * Counts active products for statistics.
     */
    @Query("SELECT COUNT(p) FROM Product p WHERE p.status = 'ACTIVE'")
    long countActiveProducts();
}