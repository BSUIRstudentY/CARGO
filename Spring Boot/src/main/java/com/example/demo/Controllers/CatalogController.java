package com.example.demo.Controllers;

import com.example.demo.Entities.Catalog;
import com.example.demo.Entities.Product;
import com.example.demo.Repositories.CatalogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    @Autowired
    private CatalogRepository catalogRepository;

    @GetMapping
    public ResponseEntity<?> getCatalog(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Float minPrice,
            @RequestParam(required = false) Float maxPrice,
            @RequestParam(required = false) String sortBy) {

        // Настройка пагинации и сортировки
        Pageable pageable = PageRequest.of(page, size);
        if (sortBy != null) {
            switch (sortBy) {
                case "price_asc":
                    pageable = PageRequest.of(page, size, Sort.by("product.price").ascending());
                    break;
                case "price_desc":
                    pageable = PageRequest.of(page, size, Sort.by("product.price").descending());
                    break;
                case "sales_desc":
                    pageable = PageRequest.of(page, size, Sort.by("product.salesCount").descending());
                    break;
                default:
                    pageable = PageRequest.of(page, size);
            }
        }

        // Запрос к Catalog (без фильтра по status)
        Page<Catalog> catalogPage;
        if (searchTerm != null && !searchTerm.isEmpty()) {
            if (minPrice != null && maxPrice != null) {
                catalogPage = catalogRepository.findByProductNameContainingIgnoreCaseAndProductPriceBetween(searchTerm, minPrice, maxPrice, pageable);
            } else {
                catalogPage = catalogRepository.findByProductNameContainingIgnoreCase(searchTerm, pageable);
            }
        } else if (minPrice != null || maxPrice != null) {
            Float finalMinPrice = minPrice != null ? minPrice : Float.MIN_VALUE;
            Float finalMaxPrice = maxPrice != null ? maxPrice : Float.MAX_VALUE;
            catalogPage = catalogRepository.findByProductPriceBetween(finalMinPrice, finalMaxPrice, pageable);
        } else {
            catalogPage = catalogRepository.findAll(pageable);
        }

        // Преобразуем Catalog в Product
        List<Product> products = catalogPage.getContent().stream()
                .map(Catalog::getProduct)
                .filter(product -> product != null) // Фильтруем null
                .collect(Collectors.toList());

        // Формируем ответ
        Map<String, Object> response = new HashMap<>();
        response.put("content", products);
        response.put("totalPages", catalogPage.getTotalPages());
        response.put("totalElements", catalogPage.getTotalElements());

        return ResponseEntity.ok(response);
    }
}