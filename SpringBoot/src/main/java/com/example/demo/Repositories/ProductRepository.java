package com.example.demo.Repositories;

import com.example.demo.Entities.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    Optional<Product> findById(String id);
    boolean existsById(String id);
    Page<Product> findAllByOrderByPriceAsc(Pageable pageable);
    Page<Product> findAllByOrderByPriceDesc(Pageable pageable);
    Page<Product> findAllByOrderBySalesCountDesc(Pageable pageable);
    @Query("SELECT p FROM Product p WHERE p.id != :id AND LOWER(p.name) LIKE %:keyword%")
    List<Product> findSimilarByName(@Param("id") String id, @Param("keyword") String keyword);
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Product> findByPriceBetween(Float minPrice, Float maxPrice, Pageable pageable);

    // Новые методы для фильтрации по статусу VERIFIED
    Page<Product> findAllByStatus(String status, Pageable pageable);

    Page<Product> findByNameContainingIgnoreCaseAndStatus(String name, String status, Pageable pageable);

    Page<Product> findByPriceBetweenAndStatus(Float minPrice, Float maxPrice, String status, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.id != :id AND LOWER(p.name) LIKE %:keyword% AND p.status = :status")
    List<Product> findSimilarByNameAndStatus(@Param("id") String id, @Param("keyword") String keyword, @Param("status") String status);
}