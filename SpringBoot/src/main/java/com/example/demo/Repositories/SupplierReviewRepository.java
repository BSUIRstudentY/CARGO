package com.example.demo.Repositories;

import com.example.demo.Entities.SupplierReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierReviewRepository extends JpaRepository<SupplierReview, Long> {
    Page<SupplierReview> findBySupplierId(Long id, Pageable pageable);
}