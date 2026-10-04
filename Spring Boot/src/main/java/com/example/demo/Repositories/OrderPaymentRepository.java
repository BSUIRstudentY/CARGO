package com.example.demo.Repositories;

import com.example.demo.Entities.OrderPayment;
import com.example.demo.Entities.PaymentPurpose;
import com.example.demo.Entities.PaymentState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderPaymentRepository extends JpaRepository<OrderPayment, Long> {
    List<OrderPayment> findByOrderIdOrderByCreatedAtAsc(Long orderId);

    Optional<OrderPayment> findFirstByOrderIdAndPurposeAndStatusOrderByCreatedAtDesc(
            Long orderId, PaymentPurpose purpose, PaymentState status);

    Optional<OrderPayment> findFirstByOrderIdAndStatusOrderByCreatedAtDesc(Long orderId, PaymentState status);
}
