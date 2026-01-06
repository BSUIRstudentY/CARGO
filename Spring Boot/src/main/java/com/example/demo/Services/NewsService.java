package com.example.demo.Services;

import com.example.demo.Entities.News;
import com.example.demo.Repositories.NewsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Service
public class NewsService {
    private static final Logger logger = LoggerFactory.getLogger(NewsService.class);

    @Autowired
    private NewsRepository newsRepository;

    /**
     * Get all active news (visible to users).
     */
    public List<News> getActiveNews() {
        return newsRepository.findActiveNews();
    }

    /**
     * Get paginated active news.
     */
    public Page<News> getActiveNewsPageable(Pageable pageable) {
        return newsRepository.findActiveNewsPageable(pageable);
    }

    /**
     * Get all news (for admin).
     */
    public Page<News> getAllNews(Pageable pageable) {
        return newsRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    /**
     * Get news by ID.
     */
    public Optional<News> getNewsById(Long id) {
        return newsRepository.findById(id);
    }

    /**
     * Create new news.
     */
    @Transactional
    public News createNews(News news) {
        news.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        news.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        if (news.getStatus() != null && !news.getStatus().equals("draft")) {
            news.setPublishedAt(new Timestamp(System.currentTimeMillis()));
        }
        return newsRepository.save(news);
    }

    /**
     * Update existing news.
     */
    @Transactional
    public News updateNews(Long id, News newsDetails) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("News not found with id: " + id));
        
        news.setTitle(newsDetails.getTitle());
        news.setDescription(newsDetails.getDescription());
        news.setType(newsDetails.getType());
        news.setStatus(newsDetails.getStatus());
        news.setImageUrl(newsDetails.getImageUrl());
        news.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        
        // Set publishedAt if status changed to active/info/promo from draft
        if (!"draft".equals(newsDetails.getStatus()) && news.getPublishedAt() == null) {
            news.setPublishedAt(new Timestamp(System.currentTimeMillis()));
        }
        
        return newsRepository.save(news);
    }

    /**
     * Delete news.
     */
    @Transactional
    public void deleteNews(Long id) {
        if (!newsRepository.existsById(id)) {
            throw new RuntimeException("News not found with id: " + id);
        }
        newsRepository.deleteById(id);
        logger.info("News deleted with id: {}", id);
    }

    /**
     * Get news by status.
     */
    public List<News> getNewsByStatus(String status) {
        return newsRepository.findByStatus(status);
    }

    /**
     * Get news by type.
     */
    public List<News> getNewsByType(String type) {
        return newsRepository.findByType(type);
    }
}

