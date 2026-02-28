package com.example.demo.Controllers;


import com.example.demo.Components.ContextHolder;
import com.example.demo.DTO.ProductReviewDTO;
import com.example.demo.Entities.Product;
import com.example.demo.Entities.QuestConditionType;
import com.example.demo.POJO.QuestEvent;
import com.example.demo.Repositories.ProductRepository;
import com.example.demo.Services.ProductReviewService;
import com.example.demo.Services.QuestService;
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
    @Autowired
    private QuestService questService;
    
    @PostMapping
    public ResponseEntity<ProductReviewDTO> createReview(@RequestBody ProductReviewDTO reviewDTO, Authentication authentication) {
        String userEmail = ContextHolder.getCurrentUserEmail();
        Product product = productRepository.findById(reviewDTO.getProductId()).get();
        product.addReview(reviewDTO.getRating());
        productRepository.save(product);
        ProductReviewDTO createdReview = reviewService.createReview(reviewDTO, userEmail);
        
        // Обновляем квест REVIEW (оставить отзыв)
        try {
            QuestEvent reviewEvent = new QuestEvent(userEmail, QuestConditionType.REVIEW);
            questService.handleEvent(reviewEvent);
        } catch (Exception e) {
            System.err.println("Error processing REVIEW quest event: " + e.getMessage());
            e.printStackTrace();
        }
        
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