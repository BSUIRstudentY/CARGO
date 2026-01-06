package com.example.demo.Repositories;

import com.example.demo.Entities.OrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderHistoryRepository extends JpaRepository<OrderHistory, Long> {
    List<OrderHistory> findByUserEmail(String userEmail);
    Page<OrderHistory> findByUserEmail(String userEmail, Pageable pageable);
}