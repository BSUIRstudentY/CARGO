package com.example.demo.Services;

import com.example.demo.DTO.ProductReviewDTO;
import com.example.demo.Entities.Product;
import com.example.demo.Entities.ProductReview;
import com.example.demo.Entities.User;

import com.example.demo.Repositories.ProductRepository;
import com.example.demo.Repositories.ProductReviewRepository;
import com.example.demo.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductReviewService {
    @Autowired
    private ProductReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public ProductReviewDTO createReview(ProductReviewDTO reviewDTO, String userEmail) {
        Product product = productRepository.findById(reviewDTO.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Продукт не найден: " + reviewDTO.getProductId()));
        User user = userRepository.findById(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден: " + userEmail));

        if (reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
            throw new IllegalArgumentException("Рейтинг должен быть от 1 до 5");
        }

        ProductReview review = new ProductReview();
        review.setProduct(product);
        review.setUser(user);
        review.setComment(reviewDTO.getComment());
        review.setRating(reviewDTO.getRating());

        review = reviewRepository.save(review);

        ProductReviewDTO result = new ProductReviewDTO();
        result.setId(review.getId());
        result.setProductId(review.getProduct().getId());
        result.setUserEmail(review.getUser().getEmail());
        result.setUsername(review.getUser().getUsername());
        result.setComment(review.getComment());
        result.setRating(review.getRating());
        result.setCreatedAt(review.getCreatedAt());

        return result;
    }

    public Page<ProductReviewDTO> getReviewsByProductId(String productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ProductReview> reviewPage = reviewRepository.findByProductId(productId, pageable);
        return reviewPage.map(review -> {
            ProductReviewDTO dto = new ProductReviewDTO();
            dto.setId(review.getId());
            dto.setProductId(review.getProduct().getId());
            dto.setUserEmail(review.getUser().getEmail());
            dto.setUsername(review.getUser().getUsername());
            dto.setComment(review.getComment());
            dto.setRating(review.getRating());
            dto.setCreatedAt(review.getCreatedAt());
            return dto;
        });
    }
}