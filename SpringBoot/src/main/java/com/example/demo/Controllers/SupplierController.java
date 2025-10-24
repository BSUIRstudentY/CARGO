package com.example.demo.Controllers;

import com.example.demo.Entities.Supplier;
import com.example.demo.Repositories.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SupplierController {

    @Autowired
    private SupplierRepository supplierRepository;

    @GetMapping("/suppliers")
    public ResponseEntity<?> getSuppliers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Float minRating,
            @RequestParam(required = false) Float maxRating,
            @RequestParam(required = false) String sortBy) {

        Pageable pageable = PageRequest.of(page, size);
        if (sortBy != null) {
            switch (sortBy) {
                case "rating_asc":
                    pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by("rating").ascending());
                    break;
                case "rating_desc":
                    pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by("rating").descending());
                    break;
                case "review_count_desc":
                    pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by("reviewCount").descending());
                    break;
                default:
                    pageable = PageRequest.of(page, size);
            }
        }

        Page<Supplier> supplierPage = supplierRepository.findAllByRole("CARGO", pageable);

        if (searchTerm != null) {
            supplierPage = supplierRepository.findByCompanyNameContainingIgnoreCaseAndRole(searchTerm, "CARGO", pageable);
        }
        if (minRating != null || maxRating != null) {
            Float finalMinRating = minRating != null ? minRating : 0.0f;
            Float finalMaxRating = maxRating != null ? maxRating : 5.0f;
            supplierPage = supplierRepository.findByRatingBetweenAndRole(finalMinRating, finalMaxRating, "CARGO", pageable);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("content", supplierPage.getContent());
        response.put("totalPages", supplierPage.getTotalPages());
        response.put("totalElements", supplierPage.getTotalElements());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/suppliers/{id}")
    public ResponseEntity<Supplier> getSupplierById(@PathVariable Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Поставщик с ID " + id + " не найден"));
        return ResponseEntity.ok(supplier);
    }
}