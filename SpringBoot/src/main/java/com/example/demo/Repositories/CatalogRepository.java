package com.example.demo.Repositories;

import com.example.demo.Entities.Catalog;
import com.example.demo.Entities.Product;
import org.apache.kafka.common.protocol.types.Field;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CatalogRepository extends JpaRepository<Catalog, Long> {

    // Поиск по ID каталога
    Optional<Catalog> findById(Long id);

    // Проверка существования по ID
    boolean existsById(Long id);

    // Пагинация и сортировка по цене продукта (из связанного Product)
    Page<Catalog> findAllByOrderByProductPriceAsc(Pageable pageable);
    Page<Catalog> findAllByOrderByProductPriceDesc(Pageable pageable);

    // Сортировка по количеству продаж (salesCount из Product)
    Page<Catalog> findAllByOrderByProductSalesCountDesc(Pageable pageable);

    // Поиск похожих продуктов по имени (аналог findSimilarByName)
    @Query("SELECT c FROM Catalog c WHERE c.product.id != :id AND LOWER(c.product.name) LIKE %:keyword%")
    List<Catalog> findSimilarByName(@Param("id") String id, @Param("keyword") String keyword);

    // Поиск по части имени (игнорируя регистр)
    Page<Catalog> findByProductNameContainingIgnoreCase(String name, Pageable pageable);

    // Поиск по диапазону цен
    Page<Catalog> findByProductPriceBetween(Float minPrice, Float maxPrice, Pageable pageable);

    // Поиск по части имени и диапазону цен
    Page<Catalog> findByProductNameContainingIgnoreCaseAndProductPriceBetween(
            String name, Float minPrice, Float maxPrice, Pageable pageable);

    boolean existsByProductId(String productId);
}