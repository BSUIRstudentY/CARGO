package com.example.demo.Controllers;

import com.example.demo.Entities.OrderHistory;
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
    public ResponseEntity<List<OrderHistoryDTO>> getOrderHistory() {
        String userEmail = getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(403).body(null);
        }

        List<OrderHistory> orders = orderHistoryRepository.findByUserEmail(userEmail);
        List<OrderHistoryDTO> orderDTOs = orders.stream()
                .map(order -> {
                    OrderHistoryDTO orderDTO = new OrderHistoryDTO();
                    orderDTO.setId(order.getId());
                    orderDTO.setOrderNumber(order.getOrderNumber());
                    orderDTO.setDateCreated(order.getDateCreated());
                    orderDTO.setStatus(order.getStatus());
                    orderDTO.setTotalClientPrice(order.getTotalClientPrice());
                    orderDTO.setItems(order.getItems().stream()
                            .map(item -> {
                                OrderItemDTO itemDTO = new OrderItemDTO();
                                itemDTO.setProductId(item.getProduct().getId());
                                itemDTO.setProductName(item.getProduct().getName());
                                itemDTO.setQuantity(item.getQuantity());
                                itemDTO.setPriceAtTime(item.getPriceAtTime());
                                return itemDTO;
                            })
                            .collect(Collectors.toList()));
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
}

@Data
class OrderHistoryDTO {
    private Long id;
    private String orderNumber;
    private Timestamp dateCreated;
    private String status;
    private Float totalClientPrice;
    private List<OrderItemDTO> items;
}


