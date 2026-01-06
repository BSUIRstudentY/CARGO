package com.example.demo.Repositories;

import com.example.demo.Entities.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findTopByOrderIdOrderByCreatedAtDesc(Long orderId);

    List<Transaction> findAllByOrderId(Long orderId);
}
