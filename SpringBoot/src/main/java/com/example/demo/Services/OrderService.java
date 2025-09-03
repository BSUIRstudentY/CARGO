package com.example.demo.Services;

import com.example.demo.Entities.Order;
import com.example.demo.Entities.OrderHistory;
import com.example.demo.Entities.OrderItem;
import com.example.demo.Repositories.OrderHistoryRepository;
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
    @Autowired
    private OrderHistoryRepository orderHistoryRepository;

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

        if ("REFUSED".equals(updatedOrder.getStatus()) || "RECEIVED".equals(updatedOrder.getStatus())) {
            OrderHistory history = new OrderHistory();
            history.setOrderNumber(order.getOrderNumber());
            history.setUser(order.getUser());
            history.setStatus(order.getStatus());
            history.setReasonRefusal(order.getReasonRefusal());
            history.setTotalClientPrice(order.getTotalClientPrice());
            history.setDeliveryAddress(order.getDeliveryAddress());
            history.setTrackingNumber(order.getTrackingNumber());
            history.setDateCreated(order.getDateCreated());
            history.setItems(order.getItems().stream()
                    .map(item -> {
                        OrderItem historyItem = new OrderItem();
                        historyItem.setOrderHistory(history);
                        historyItem.setProduct(item.getProduct());
                        historyItem.setQuantity(item.getQuantity());
                        historyItem.setPriceAtTime(item.getPriceAtTime());
                        historyItem.setSupplierPrice(item.getSupplierPrice());
                        return historyItem;
                    })
                    .collect(Collectors.toList()));
            orderHistoryRepository.save(history);
            orderRepository.delete(order); // Optionally delete from orders table
        }
        return order;
    }
}