package com.example.demo.Controllers;

import com.example.demo.Entities.OrderHistory;
import com.example.demo.Entities.OrderItem;
import com.example.demo.Repositories.OrderHistoryRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    public ResponseEntity<OrderHistoryPageDTO> getOrderHistory(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String userEmail = getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(403).body(null);
        }

        // Validate status
        if (status != null && !status.equals("ALL") && !List.of("REFUSED", "COMPLETED", "PENDING").contains(status)) {
            return ResponseEntity.badRequest().body(null);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<OrderHistory> orderPage;
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin && status != null && !status.equals("ALL")) {
            orderPage = (Page<OrderHistory>) orderHistoryRepository.findAll(pageable)
                    .map(order -> order.getStatus().equals(status) ? order : null)
                    .filter(order -> order != null);
        } else if (isAdmin) {
            orderPage = orderHistoryRepository.findAll(pageable);
        } else if (status != null && !status.equals("ALL")) {
            orderPage = (Page<OrderHistory>) orderHistoryRepository.findByUserEmail(userEmail, pageable)
                    .map(order -> order.getStatus().equals(status) ? order : null)
                    .filter(order -> order != null);
        } else {
            orderPage = orderHistoryRepository.findByUserEmail(userEmail, pageable);
        }

        List<OrderHistoryDTO> orderDTOs = orderPage.getContent().stream()
                .map(order -> {
                    OrderHistoryDTO orderDTO = new OrderHistoryDTO();
                    orderDTO.setId(order.getId());
                    orderDTO.setOrderNumber(order.getOrderNumber());
                    orderDTO.setDateCreated(order.getDateCreated());
                    orderDTO.setStatus(order.getStatus());
                    orderDTO.setTotalClientPrice(order.getTotalClientPrice());
                    orderDTO.setSupplierCost(order.getSupplierCost());
                    orderDTO.setCustomsDuty(order.getCustomsDuty());
                    orderDTO.setShippingCost(order.getShippingCost());
                    orderDTO.setDeliveryAddress(order.getDeliveryAddress());
                    orderDTO.setTrackingNumber(order.getTrackingNumber());
                    orderDTO.setReasonRefusal(order.getReasonRefusal());
                    orderDTO.setInsurance(order.getInsurance());
                    orderDTO.setDiscountType(order.getDiscountType());
                    orderDTO.setDiscountValue(order.getDiscountValue());
                    orderDTO.setPromocode(order.getPromocode() != null ? order.getPromocode().getCode() : null); // Fixed null check
                    orderDTO.setInsuranceCost(order.getInsuranceCost());
                    orderDTO.setUserDiscountApplied(order.getUserDiscountApplied());
                    orderDTO.setItems(order.getItems().stream()
                            .map(item -> {
                                OrderItemDTO itemDTO = new OrderItemDTO();
                                try {
                                    itemDTO.setId(item.getId());
                                    itemDTO.setProductId(item.getProduct() != null ? item.getProduct().getId().toString() : null);
                                    itemDTO.setProductName(item.getProduct() != null ? item.getProduct().getName() : "Unknown");
                                    itemDTO.setUrl(item.getProduct() != null ? item.getProduct().getUrl() : null);
                                    itemDTO.setImageUrl(item.getProduct() != null && item.getProduct().getImageUrl() != null
                                            ? item.getProduct().getImageUrl()
                                            : "https://placehold.co/128x128?text=No+Image");
                                    itemDTO.setDescription(item.getProduct() != null ? item.getProduct().getDescription() : null);
                                    itemDTO.setQuantity(item.getQuantity());
                                    itemDTO.setPriceAtTime(item.getPriceAtTime());
                                    itemDTO.setSupplierPrice(item.getSupplierPrice());
                                    itemDTO.setPurchaseStatus(item.getPurchaseStatus());
                                    itemDTO.setPurchaseRefusalReason(item.getPurchaseRefusalReason());
                                    itemDTO.setTrackingNumber(item.getTrackingNumber());
                                    itemDTO.setChinaDeliveryPrice(item.getChinaDeliveryPrice());
                                } catch (Exception e) {
                                    System.err.println("Error mapping product for OrderItem ID: " + item.getId() + " in Order ID: " + order.getId());
                                    itemDTO.setId(item.getId());
                                    itemDTO.setProductId(null);
                                    itemDTO.setProductName("Unknown");
                                    itemDTO.setUrl(null);
                                    itemDTO.setImageUrl("https://placehold.co/128x128?text=No+Image");
                                    itemDTO.setDescription(null);
                                    itemDTO.setQuantity(item.getQuantity());
                                    itemDTO.setPriceAtTime(item.getPriceAtTime());
                                    itemDTO.setSupplierPrice(item.getSupplierPrice());
                                    itemDTO.setPurchaseStatus(item.getPurchaseStatus());
                                    itemDTO.setPurchaseRefusalReason(item.getPurchaseRefusalReason());
                                    itemDTO.setTrackingNumber(item.getTrackingNumber());
                                    itemDTO.setChinaDeliveryPrice(item.getChinaDeliveryPrice());
                                }
                                return itemDTO;
                            })
                            .collect(Collectors.toList()));
                    orderDTO.setUserEmail(order.getUser().getEmail());
                    return orderDTO;
                })
                .collect(Collectors.toList());

        OrderHistoryPageDTO pageDTO = new OrderHistoryPageDTO();
        pageDTO.setOrders(orderDTOs);
        pageDTO.setCurrentPage(orderPage.getNumber());
        pageDTO.setTotalPages(orderPage.getTotalPages());
        pageDTO.setTotalItems(orderPage.getTotalElements());

        return ResponseEntity.ok(pageDTO);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<OrderHistoryDTO> getOrderById(@PathVariable Long id) {
        String userEmail = getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(403).body(null);
        }

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        OrderHistory order = orderHistoryRepository.findById(id).orElse(null);
        if (order == null) {
            return ResponseEntity.status(404).body(null);
        }

        // Check if the user is authorized to view this order
        if (!isAdmin && !order.getUser().getEmail().equals(userEmail)) {
            return ResponseEntity.status(403).body(null);
        }

        // Validate status
        if (!List.of("REFUSED", "COMPLETED", "PENDING").contains(order.getStatus())) {
            return ResponseEntity.badRequest().body(null);
        }

        OrderHistoryDTO orderDTO = new OrderHistoryDTO();
        orderDTO.setId(order.getId());
        orderDTO.setOrderNumber(order.getOrderNumber());
        orderDTO.setDateCreated(order.getDateCreated());
        orderDTO.setStatus(order.getStatus());
        orderDTO.setTotalClientPrice(order.getTotalClientPrice());
        orderDTO.setSupplierCost(order.getSupplierCost());
        orderDTO.setCustomsDuty(order.getCustomsDuty());
        orderDTO.setShippingCost(order.getShippingCost());
        orderDTO.setDeliveryAddress(order.getDeliveryAddress());
        orderDTO.setTrackingNumber(order.getTrackingNumber());
        orderDTO.setReasonRefusal(order.getReasonRefusal());
        orderDTO.setInsurance(order.getInsurance());
        orderDTO.setDiscountType(order.getDiscountType());
        orderDTO.setDiscountValue(order.getDiscountValue());
        orderDTO.setPromocode(order.getPromocode() != null ? order.getPromocode().getCode() : null); // Fixed null check
        orderDTO.setInsuranceCost(order.getInsuranceCost());
        orderDTO.setUserDiscountApplied(order.getUserDiscountApplied());
        orderDTO.setItems(order.getItems().stream()
                .map(item -> {
                    OrderItemDTO itemDTO = new OrderItemDTO();
                    try {
                        itemDTO.setId(item.getId());
                        itemDTO.setProductId(item.getProduct() != null ? item.getProduct().getId().toString() : null);
                        itemDTO.setProductName(item.getProduct() != null ? item.getProduct().getName() : "Unknown");
                        itemDTO.setUrl(item.getProduct() != null ? item.getProduct().getUrl() : null);
                        itemDTO.setImageUrl(item.getProduct() != null && item.getProduct().getImageUrl() != null
                                ? item.getProduct().getImageUrl()
                                : "https://placehold.co/128x128?text=No+Image");
                        itemDTO.setDescription(item.getProduct() != null ? item.getProduct().getDescription() : null);
                        itemDTO.setQuantity(item.getQuantity());
                        itemDTO.setPriceAtTime(item.getPriceAtTime());
                        itemDTO.setSupplierPrice(item.getSupplierPrice());
                        itemDTO.setPurchaseStatus(item.getPurchaseStatus());
                        itemDTO.setPurchaseRefusalReason(item.getPurchaseRefusalReason());
                        itemDTO.setTrackingNumber(item.getTrackingNumber());
                        itemDTO.setChinaDeliveryPrice(item.getChinaDeliveryPrice());
                    } catch (Exception e) {
                        System.err.println("Error mapping product for OrderItem ID: " + item.getId() + " in Order ID: " + order.getId());
                        itemDTO.setId(item.getId());
                        itemDTO.setProductId(null);
                        itemDTO.setProductName("Unknown");
                        itemDTO.setUrl(null);
                        itemDTO.setImageUrl("https://placehold.co/128x128?text=No+Image");
                        itemDTO.setDescription(null);
                        itemDTO.setQuantity(item.getQuantity());
                        itemDTO.setPriceAtTime(item.getPriceAtTime());
                        itemDTO.setSupplierPrice(item.getSupplierPrice());
                        itemDTO.setPurchaseStatus(item.getPurchaseStatus());
                        itemDTO.setPurchaseRefusalReason(item.getPurchaseRefusalReason());
                        itemDTO.setTrackingNumber(item.getTrackingNumber());
                        itemDTO.setChinaDeliveryPrice(item.getChinaDeliveryPrice());
                    }
                    return itemDTO;
                })
                .collect(Collectors.toList()));
        orderDTO.setUserEmail(order.getUser().getEmail());

        return ResponseEntity.ok(orderDTO);
    }

    private String getCurrentUserEmail() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return null;
        }
    }

    @Data
    static class OrderHistoryPageDTO {
        private List<OrderHistoryDTO> orders;
        private int currentPage;
        private int totalPages;
        private long totalItems;
    }

    @Data
    static class OrderHistoryDTO {
        private Long id;
        private String orderNumber;
        private Timestamp dateCreated;
        private String status;
        private Float totalClientPrice;
        private Float supplierCost;
        private Float customsDuty;
        private Float shippingCost;
        private String deliveryAddress;
        private String trackingNumber;
        private String reasonRefusal;
        private Boolean insurance;
        private String discountType;
        private Float discountValue;
        private String promocode;
        private Float insuranceCost;
        private Float userDiscountApplied;
        private List<OrderItemDTO> items;
        private String userEmail;
    }

    @Data
    static class OrderItemDTO {
        private Long id;
        private String productId;
        private String productName;
        private Integer quantity;
        private Float priceAtTime;
        private String url;
        private String imageUrl;
        private String description;
        private Float supplierPrice;
        private String purchaseStatus;
        private String purchaseRefusalReason;
        private String trackingNumber;
        private Float chinaDeliveryPrice;
    }
}