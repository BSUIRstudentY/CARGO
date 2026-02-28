package com.example.demo.Services;

import com.example.demo.Entities.Order;
import com.example.demo.Entities.OrderItem;
import com.example.demo.Repositories.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Transactional
    public Order updateOrder(Long id, Order updatedOrder) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        order.setStatus(updatedOrder.getStatus());
        order.setReasonRefusal(updatedOrder.getReasonRefusal());
        order.setTotalClientPrice(updatedOrder.getTotalClientPrice());
        order.setDeliveryAddress(updatedOrder.getDeliveryAddress());
        order.setTrackingNumber(updatedOrder.getTrackingNumber());
        orderRepository.save(order);

        return order;
    }
}