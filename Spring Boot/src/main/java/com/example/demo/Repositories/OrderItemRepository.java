package com.example.demo.Repositories;

import com.example.demo.Entities.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    /**
     * Проверяет, заказывал ли пользователь определенный товар в оплаченных заказах
     * Статусы для проверки: PAID, PROCESSED, COMPLETED (заказ считается выполненным)
     */
    @Query("SELECT oi FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.user.email = :userEmail " +
           "AND oi.product.id = :productId " +
           "AND o.status IN ('PAID', 'PROCESSED', 'COMPLETED')")
    List<OrderItem> findByUserEmailAndProductIdInPaidOrders(
            @Param("userEmail") String userEmail,
            @Param("productId") String productId
    );
}