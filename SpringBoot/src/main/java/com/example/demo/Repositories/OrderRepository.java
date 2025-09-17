package com.example.demo.Repositories;

import com.example.demo.Entities.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    // Non-paginated methods (kept for compatibility, if needed)
    List<Order> findByUserEmail(String userEmail);
    List<Order> findByUserEmailAndStatus(String userEmail, String status);
    List<Order> findByStatus(String status);
    List<Order> findByStatusIn(List<String> statuses);
    List<Order> findByStatusNotIn(List<String> statuses);


    long count();

    // Paginated methods
    Page<Order> findByUserEmail(String userEmail, Pageable pageable);
    Page<Order> findByUserEmailAndStatus(String userEmail, String status, Pageable pageable);
    Page<Order> findByStatus(String status, Pageable pageable);
    Page<Order> findByStatusIn(List<String> statuses, Pageable pageable);
    Page<Order> findByStatusNotIn(List<String> statuses, Pageable pageable);
    Page<Order> findByStatusNotInAndUserEmail(List<String> statuses, String userEmail, Pageable pageable);
}