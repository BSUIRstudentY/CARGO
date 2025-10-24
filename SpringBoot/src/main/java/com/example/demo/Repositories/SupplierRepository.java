package com.example.demo.Repositories;

import com.example.demo.Entities.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, String> {
    Optional<Supplier> findById(Long id);
    Boolean existsByEmail(String email);
    Optional<Supplier> findByEmail(String email);
    Page<Supplier> findAllByRole(String role, Pageable pageable);
    Page<Supplier> findByCompanyNameContainingIgnoreCaseAndRole(String companyName, String role, Pageable pageable);
    Page<Supplier> findByRatingBetweenAndRole(Float minRating, Float maxRating, String role, Pageable pageable);
}