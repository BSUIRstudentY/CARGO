package com.example.demo.Controllers;

import com.example.demo.Entities.Product;
import com.example.demo.Repositories.ProductRepository;
import com.example.demo.Services.ClusteringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    @PostMapping("/products/bulk")
    public ResponseEntity<?> saveBulkProducts(@RequestBody List<Product> products) {
        if (products == null || products.isEmpty()) {
            return ResponseEntity.badRequest().body("Список товаров пуст");
        }
        List<Product> validProducts = products.stream()
                .filter(p -> p.getId() != null && !p.getId().isEmpty() && p.getUrl() != null && !p.getUrl().isEmpty() && p.getPrice() != null)
                .peek(p -> {
                    if (!repository.existsById(p.getId())) {
                        p.setLastUpdated(new Timestamp(System.currentTimeMillis()));
                    }
                })
                .collect(Collectors.toList());
        if (validProducts.isEmpty()) {
            return ResponseEntity.badRequest().body("Нет валидных товаров для сохранения");
        }
        repository.saveAll(validProducts); // Массовое сохранение для оптимизации
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("count", validProducts.size(), "message", "Товары сохранены"));
    }

    @PutMapping("/products/bulk-status")
    public ResponseEntity<?> updateBulkProductStatus(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<String> ids = (List<String>) request.get("ids");
        String status = (String) request.get("status");
        if (ids == null || ids.isEmpty() || status == null) {
            return ResponseEntity.badRequest().body("IDs и статус обязательны");
        }
        List<Product> products = repository.findAllById(ids);
        if (products.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Товары не найдены");
        }
        products.forEach(p -> p.setStatus(status));
        repository.saveAll(products); // Массовое обновление
        return ResponseEntity.ok(Map.of("count", products.size(), "message", "Статусы обновлены"));
    }

    @GetMapping("/products")
    public ResponseEntity<?> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Float minPrice,
            @RequestParam(required = false) Float maxPrice,
            @RequestParam(required = false) String sortBy) {

        Pageable pageable = PageRequest.of(page, size);
        if (sortBy != null) {
            switch (sortBy) {
                case "price_asc":
                    pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by("price").ascending());
                    break;
                case "price_desc":
                    pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by("price").descending());
                    break;
                case "sales_desc":
                    pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by("salesCount").descending());
                    break;
                default:
                    pageable = PageRequest.of(page, size);
            }
        }

        Page<Product> productPage = repository.findAllByStatus("VERIFIED", pageable);

        if (searchTerm != null) {
            productPage = repository.findByNameContainingIgnoreCaseAndStatus(searchTerm, "VERIFIED", pageable);
        }
        if (minPrice != null || maxPrice != null) {
            Float finalMinPrice = minPrice != null ? minPrice : Float.MIN_VALUE;
            Float finalMaxPrice = maxPrice != null ? maxPrice : Float.MAX_VALUE;
            productPage = repository.findByPriceBetweenAndStatus(finalMinPrice, finalMaxPrice, "VERIFIED", pageable);
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

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        Product product = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Продукт с ID " + id + " не найден"));
        return ResponseEntity.ok(product);
    }

    @GetMapping("/products/similar/{id}")
    public ResponseEntity<List<Product>> getSimilarProducts(@PathVariable String id) {
        Product product = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Продукт с ID " + id + " не найден"));

        if (product.getName() == null) {
            return ResponseEntity.ok(List.of());
        }

        String[] keywords = product.getName().toLowerCase()
                .replaceAll("[^a-zA-Zа-яА-Я0-9\\s]", "")
                .split("\\s+");
        List<String> filteredKeywords = java.util.Arrays.stream(keywords)
                .filter(word -> word.length() > 2)
                .collect(Collectors.toList());

        if (filteredKeywords.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<Product> similarProducts = new ArrayList<>();
        for (String keyword : filteredKeywords) {
            List<Product> matches = repository.findSimilarByNameAndStatus(id, keyword.toLowerCase(), "VERIFIED");
            similarProducts.addAll(matches);
        }

        similarProducts = similarProducts.stream()
                .distinct()
                .limit(4)
                .collect(Collectors.toList());

        return ResponseEntity.ok(similarProducts);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable String id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Продукт с ID " + id + " не найден");
        }
        repository.deleteById(id);
        return ResponseEntity.ok(Map.of("id", id, "message", "Продукт удалён"));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable String id, @RequestBody Product product) {
        if (!id.equals(product.getId())) {
            return ResponseEntity.badRequest().body("ID в пути и теле не совпадают");
        }
        if (!repository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Продукт с ID " + id + " не найден");
        }
        if (product.getUrl() == null || product.getUrl().isEmpty()) {
            return ResponseEntity.badRequest().body("URL обязателен");
        }
        if (product.getPrice() == null) {
            return ResponseEntity.badRequest().body("Цена обязательна");
        }

        product.setLastUpdated(new Timestamp(System.currentTimeMillis()));
        repository.save(product);
        return ResponseEntity.ok(Map.of("id", product.getId(), "message", "Продукт обновлён"));
    }
}