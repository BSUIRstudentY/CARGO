package com.example.demo.Controllers;

import com.example.demo.Entities.Review;
import com.example.demo.Repositories.ProductRepository;
import com.example.demo.Services.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {



    @Autowired
    private ReviewService reviewService;

    @GetMapping
    public Page<Review> getAllReviews(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int minRating,
            @RequestParam(defaultValue = "date_desc") String sort
    ) {
        Pageable pageable = createPageable(page, limit, sort);
        return reviewService.getAllReviews(pageable, search, minRating);
    }

    private Pageable createPageable(int page, int limit, String sort) {
        Sort s;
        switch (sort) {
            case "date_asc":
                s = Sort.by("createdAt").ascending();
                break;
            case "rating_desc":
                s = Sort.by("rating").descending();
                break;
            case "rating_asc":
                s = Sort.by("rating").ascending();
                break;
            case "date_desc":
            default:
                s = Sort.by("createdAt").descending();
                break;
        }
        return PageRequest.of(page - 1, limit, s);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Review> getReviewById(@PathVariable Long id) {
        Optional<Review> review = reviewService.getReviewById(id);
        return review.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Review addReview(@RequestBody Review review) {

        return reviewService.addReview(review);
    }
}