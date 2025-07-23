package com.example.demo.Controller;


import com.example.demo.Entity.Product;
import com.example.demo.Repository.ProductRepository;
import com.example.demo.Services.ClusteringService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductRepository repository;
    @Autowired
    private ClusteringService clusteringService;

    @PostMapping("/products")
    public ResponseEntity<?> saveProduct(@RequestBody Product product) {
        if (product.getId() == null || product.getId().isEmpty()) {
            return ResponseEntity.badRequest().body("ID обязателен");
        }
        if (product.getUrl() == null || product.getUrl().isEmpty()) {
            return ResponseEntity.badRequest().body("URL обязателен");
        }
        if (product.getPrice() == null) {
            return ResponseEntity.badRequest().body("Цена обязательна");
        }

        if (repository.existsById(product.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Продукт с таким ID уже существует");
        }

        product.setLastUpdated(new Timestamp(System.currentTimeMillis()));
        repository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", product.getId(), "message", "Продукт сохранен"));
    }

    @GetMapping("/products")
    public ResponseEntity<?> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Float minPrice,
            @RequestParam(required = false) Float maxPrice,
            @RequestParam(required = false) String sortBy) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage;

        if (sortBy != null) {
            switch (sortBy) {
                case "price_asc":
                    productPage = repository.findAllByOrderByPriceAsc(pageable);
                    break;
                case "price_desc":
                    productPage = repository.findAllByOrderByPriceDesc(pageable);
                    break;
                case "sales_desc":
                    productPage = repository.findAllByOrderBySalesCountDesc(pageable);
                    break;
                default:
                    productPage = repository.findAll(pageable);
            }
        } else {
            productPage = repository.findAll(pageable);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("content", productPage.getContent());
        response.put("totalPages", productPage.getTotalPages());
        response.put("totalElements", productPage.getTotalElements());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/cluster")
    public ResponseEntity<?> clusterProducts(@RequestParam(defaultValue = "3") int k) {
        clusteringService.performKMeans(k);
        return ResponseEntity.ok("Кластеризация выполнена");
    }
}