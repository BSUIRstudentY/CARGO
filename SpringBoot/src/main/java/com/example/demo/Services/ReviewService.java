package com.example.demo.Services;

import com.example.demo.Entities.Review;
import com.example.demo.Repositories.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;

    public Page<Review> getAllReviews(Pageable pageable, String search, int minRating) {
        Specification<Review> spec = Specification.where(null);

        if (minRating > 0) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("rating"), minRating));
        }

        if (!search.isEmpty()) {
            String lowerSearch = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("name")), lowerSearch),
                            cb.like(cb.lower(root.get("text")), lowerSearch)
                    ));
        }

        return reviewRepository.findAll(spec, pageable);
    }

    public Optional<Review> getReviewById(Long id) {
        return reviewRepository.findById(id);
    }

    public Review addReview(Review review) {
        return reviewRepository.save(review);
    }
}