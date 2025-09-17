package com.example.demo.Controllers;


import com.example.demo.Components.ContextHolder;
import com.example.demo.DTO.ProductReviewDTO;
import com.example.demo.Entities.Product;
import com.example.demo.Repositories.ProductRepository;
import com.example.demo.Services.ProductReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/product-reviews")
public class ProductReviewController {
    @Autowired
    private ProductReviewService reviewService;
    @Autowired
    private ProductRepository productRepository;
    @PostMapping
    public ResponseEntity<ProductReviewDTO> createReview(@RequestBody ProductReviewDTO reviewDTO, Authentication authentication) {
        String userEmail = ContextHolder.getCurrentUserEmail();
        Product product = productRepository.findById(reviewDTO.getProductId()).get();
        product.addReview(reviewDTO.getRating());
        productRepository.save(product);
        ProductReviewDTO createdReview = reviewService.createReview(reviewDTO, userEmail);
        return ResponseEntity.ok(createdReview);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<ProductReviewDTO>> getReviewsByProductId(
            @PathVariable String productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ProductReviewDTO> reviews = reviewService.getReviewsByProductId(productId, page, size);
        return ResponseEntity.ok(reviews);
    }
}