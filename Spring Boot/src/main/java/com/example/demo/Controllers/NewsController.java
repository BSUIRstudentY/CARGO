package com.example.demo.Controllers;

import com.example.demo.Entities.News;
import com.example.demo.Services.NewsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller for managing news, announcements, and batch cargo updates.
 * Public endpoints for reading news, admin endpoints for CRUD operations.
 */
@RestController
@RequestMapping("/api/news")
public class NewsController {
    private static final Logger logger = LoggerFactory.getLogger(NewsController.class);

    @Autowired
    private NewsService newsService;

    /**
     * Get all active news (public endpoint).
     */
    @GetMapping
    public ResponseEntity<List<News>> getActiveNews() {
        try {
            List<News> news = newsService.getActiveNews();
            return ResponseEntity.ok(news);
        } catch (Exception e) {
            logger.error("Error fetching active news", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get paginated active news (public endpoint).
     */
    @GetMapping("/page")
    public ResponseEntity<Map<String, Object>> getActiveNewsPageable(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<News> newsPage = newsService.getActiveNewsPageable(pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", newsPage.getContent());
            response.put("totalElements", newsPage.getTotalElements());
            response.put("totalPages", newsPage.getTotalPages());
            response.put("currentPage", newsPage.getNumber());
            response.put("size", newsPage.getSize());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching paginated news", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get news by ID (public endpoint).
     */
    @GetMapping("/{id}")
    public ResponseEntity<News> getNewsById(@PathVariable Long id) {
        try {
            Optional<News> news = newsService.getNewsById(id);
            if (news.isPresent()) {
                return ResponseEntity.ok(news.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error fetching news with id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get all news with pagination (admin only).
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<News> newsPage = newsService.getAllNews(pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", newsPage.getContent());
            response.put("totalElements", newsPage.getTotalElements());
            response.put("totalPages", newsPage.getTotalPages());
            response.put("currentPage", newsPage.getNumber());
            response.put("size", newsPage.getSize());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching all news for admin", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Create new news (admin only).
     */
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<News> createNews(@RequestBody News news) {
        try {
            String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            news.setAuthorEmail(currentUserEmail);
            
            News createdNews = newsService.createNews(news);
            logger.info("News created with id: {} by admin: {}", createdNews.getId(), currentUserEmail);
            return ResponseEntity.ok(createdNews);
        } catch (Exception e) {
            logger.error("Error creating news", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Update existing news (admin only).
     */
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<News> updateNews(@PathVariable Long id, @RequestBody News newsDetails) {
        try {
            News updatedNews = newsService.updateNews(id, newsDetails);
            logger.info("News updated with id: {}", id);
            return ResponseEntity.ok(updatedNews);
        } catch (RuntimeException e) {
            logger.error("Error updating news with id: {}", id, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating news with id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Delete news (admin only).
     */
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteNews(@PathVariable Long id) {
        try {
            newsService.deleteNews(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "News deleted successfully");
            logger.info("News deleted with id: {}", id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("News not found with id: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error deleting news with id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get news by status (admin only).
     */
    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<News>> getNewsByStatus(@PathVariable String status) {
        try {
            List<News> news = newsService.getNewsByStatus(status);
            return ResponseEntity.ok(news);
        } catch (Exception e) {
            logger.error("Error fetching news by status: {}", status, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get news by type (admin only).
     */
    @GetMapping("/admin/type/{type}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<News>> getNewsByType(@PathVariable String type) {
        try {
            List<News> news = newsService.getNewsByType(type);
            return ResponseEntity.ok(news);
        } catch (Exception e) {
            logger.error("Error fetching news by type: {}", type, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}





