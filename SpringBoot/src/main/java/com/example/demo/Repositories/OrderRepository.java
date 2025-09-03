package com.example.demo.Repositories;

import com.example.demo.Entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserEmail(String userEmail);
    List<Order> findByUserEmailAndStatus(String userEmail, String status);
    List<Order> findByStatus(String status);
    List<Order> findByStatusIn(List<String> statuses);
    List<Order> findByStatusNotIn(List<String> statuses);
}