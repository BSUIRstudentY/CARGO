package com.example.demo.Controllers;

import com.example.demo.Entities.OrderHistory;
import com.example.demo.Entities.OrderItem;
import com.example.demo.Repositories.OrderHistoryRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/order-history")
public class OrderHistoryController {

    @Autowired
    private OrderHistoryRepository orderHistoryRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<OrderHistoryDTO>> getOrderHistory(@RequestParam(required = false) String status) {
        String userEmail = getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(403).body(null);
        }

        List<OrderHistory> orders;
        if (status != null && !status.equals("ALL")) {
            orders = orderHistoryRepository.findByUserEmail(userEmail).stream()
                    .filter(order -> order.getStatus().equals(status))
                    .collect(Collectors.toList());
        } else {
            orders = orderHistoryRepository.findByUserEmail(userEmail);
        }

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin && status != null && !status.equals("ALL")) {
            orders = orderHistoryRepository.findAll().stream()
                    .filter(order -> order.getStatus().equals(status))
                    .collect(Collectors.toList());
        } else if (isAdmin) {
            orders = orderHistoryRepository.findAll();
        }

        List<OrderHistoryDTO> orderDTOs = orders.stream()
                .map(order -> {
                    OrderHistoryDTO orderDTO = new OrderHistoryDTO();
                    orderDTO.setId(order.getId());
                    orderDTO.setOrderNumber(order.getOrderNumber());
                    orderDTO.setDateCreated(order.getDateCreated());
                    orderDTO.setStatus(order.getStatus());
                    orderDTO.setTotalClientPrice(order.getTotalClientPrice());
                    orderDTO.setDeliveryAddress(order.getDeliveryAddress());
                    orderDTO.setReasonRefusal(order.getReasonRefusal());
                    orderDTO.setItems(order.getItems().stream()
                            .map(item -> {
                                OrderItemDTO itemDTO = new OrderItemDTO();
                                itemDTO.setProductId(item.getProduct().getId());
                                itemDTO.setProductName(item.getProduct().getName());
                                itemDTO.setQuantity(item.getQuantity());
                                itemDTO.setPriceAtTime(item.getPriceAtTime());
                                itemDTO.setUrl(item.getProduct().getUrl());
                                itemDTO.setImageUrl(item.getProduct().getImageUrl());
                                itemDTO.setDescription(item.getProduct().getDescription());
                                itemDTO.setSupplierPrice(item.getSupplierPrice());
                                return itemDTO;
                            })
                            .collect(Collectors.toList()));
                    orderDTO.setUserEmail(order.getUser().getEmail());
                    return orderDTO;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(orderDTOs);
    }

    private String getCurrentUserEmail() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return null;
        }
    }

    @Data
    class OrderHistoryDTO {
        private Long id;
        private String orderNumber;
        private Timestamp dateCreated;
        private String status;
        private Float totalClientPrice;
        private String deliveryAddress;
        private String reasonRefusal;
        private List<OrderItemDTO> items;
        private String userEmail;
    }

    @Data
    class OrderItemDTO {
        private String productId;
        private String productName;
        private Integer quantity;
        private Float priceAtTime;
        private String url;
        private String imageUrl;
        private String description;
        private Float supplierPrice;
    }
}