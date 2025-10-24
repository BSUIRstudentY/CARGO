package com.example.demo.Controllers;

import com.example.demo.Entities.SupplierReview;
import com.example.demo.Repositories.SupplierReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SupplierReviewController {

    @Autowired
    private SupplierReviewRepository supplierReviewRepository;

    @GetMapping("/supplier-reviews/supplier/{id}")
    public ResponseEntity<?> getReviewsBySupplier(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SupplierReview> reviewPage = supplierReviewRepository.findBySupplierId(id, pageable);
        Map<String, Object> response = new HashMap<>();
        response.put("content", reviewPage.getContent());
        response.put("last", reviewPage.isLast());
        return ResponseEntity.ok(response);
    }
}