package com.example.demo.Repositories;

import com.example.demo.Entities.News;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {

    /**
     * Find all active news ordered by creation date descending.
     * Active news includes statuses: active, info, promo
     */
    @Query("SELECT n FROM News n WHERE n.status IN ('active', 'info', 'promo') ORDER BY n.createdAt DESC")
    List<News> findActiveNews();

    /**
     * Find news by status.
     */
    List<News> findByStatus(String status);

    /**
     * Find news by type.
     */
    List<News> findByType(String type);

    /**
     * Find news by status and type.
     */
    List<News> findByStatusAndType(String status, String type);

    /**
     * Find paginated active news.
     */
    @Query("SELECT n FROM News n WHERE n.status IN ('active', 'info', 'promo') ORDER BY n.createdAt DESC")
    Page<News> findActiveNewsPageable(Pageable pageable);

    /**
     * Find all news ordered by creation date descending (for admin).
     */
    Page<News> findAllByOrderByCreatedAtDesc(Pageable pageable);
}





