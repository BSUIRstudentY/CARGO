package com.example.demo.Controllers;

import com.example.demo.Entities.*;
import com.example.demo.POJO.OrderStatusEvent;
import com.example.demo.Repositories.CartRepository;
import com.example.demo.Repositories.OrderRepository;
import com.example.demo.Repositories.ProductRepository;
import com.example.demo.Repositories.UserRepository;
import com.example.demo.Repositories.OrderHistoryRepository;
import com.example.demo.Repositories.NotificationRepository;
import com.example.demo.Services.NotificationService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderHistoryRepository orderHistoryRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationService notificationService;

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public OrderController(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<OrderDTO> createOrder(@RequestBody CreateOrderRequest request) {
        String userEmail = getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(403).body(null);
        }

        Cart cart = cartRepository.findById(userEmail)
                .orElseThrow(() -> new RuntimeException("Корзина не найдена"));

        if (cart.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        Order order = new Order();
        order.setUser(user);
        order.setOrderNumber(UUID.randomUUID().toString());
        order.setDateCreated(new Timestamp(System.currentTimeMillis()));
        order.setStatus("PENDING");
        order.setTotalClientPrice((float) cart.getItems().stream()
                .mapToDouble(item -> item.getProduct().getPrice() * item.getQuantity())
                .sum());
        order.setDeliveryAddress(request.getDeliveryAddress());

        List<OrderItem> orderItems = cart.getItems().stream()
                .map(cartItem -> {
                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(order);
                    orderItem.setOrderHistory(null);
                    orderItem.setProduct(cartItem.getProduct());
                    orderItem.setQuantity(cartItem.getQuantity());
                    orderItem.setPriceAtTime(cartItem.getProduct().getPrice());
                    return orderItem;
                })
                .collect(Collectors.toList());

        order.setItems(orderItems);
        orderRepository.save(order);

        cart.getItems().clear();
        cartRepository.save(cart);

        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setId(order.getId());
        orderDTO.setOrderNumber(order.getOrderNumber());
        orderDTO.setDateCreated(order.getDateCreated());
        orderDTO.setStatus(order.getStatus());
        orderDTO.setTotalClientPrice(order.getTotalClientPrice());
        orderDTO.setDeliveryAddress(order.getDeliveryAddress());
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
                    return itemDTO;
                })
                .collect(Collectors.toList()));

        return ResponseEntity.ok(orderDTO);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) {
        String userEmail = getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(403).body(null);
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Заказ с ID " + id + " не найден"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        boolean isOrderOwner = userEmail.equals(order.getUser().getEmail());

        if (!isAdmin && !isOrderOwner) {
            return ResponseEntity.status(403).body(null);
        }

        OrderDTO orderDTO = new OrderDTO();
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
                    return itemDTO;
                })
                .collect(Collectors.toList()));
        orderDTO.setUserEmail(order.getUser().getEmail());
        return ResponseEntity.ok(orderDTO);
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<OrderDTO>> getOrders(@RequestParam(required = false) String status) {
        String userEmail = getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(403).body(null);
        }

        List<Order> orders;
        if (status != null && !status.equals("ALL")) {
            if (status.contains(",")) {
                String[] statuses = status.split(",");
                orders = orderRepository.findByStatusIn(List.of(statuses));
            } else {
                orders = orderRepository.findByStatus(status);
            }
        } else {
            orders = orderRepository.findAll();
        }

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            orders = orders.stream()
                    .filter(order -> order.getUser().getEmail().equals(userEmail))
                    .collect(Collectors.toList());
        }

        List<OrderDTO> orderDTOs = orders.stream()
                .map(order -> {
                    OrderDTO orderDTO = new OrderDTO();
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
                                return itemDTO;
                            })
                            .collect(Collectors.toList()));
                    orderDTO.setUserEmail(order.getUser().getEmail());
                    return orderDTO;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(orderDTOs);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<OrderDTO> verifyOrder(@PathVariable Long id, @RequestBody OrderDTO orderDetails) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Заказ с ID " + id + " не найден"));

        if (orderDetails.getTotalClientPrice() == null || orderDetails.getTotalClientPrice() <= 0) {
            return ResponseEntity.badRequest().body(null);
        }
        if (orderDetails.getDeliveryAddress() == null || orderDetails.getDeliveryAddress().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        order.setTotalClientPrice(orderDetails.getTotalClientPrice());
        order.setSupplierCost(orderDetails.getSupplierCost());
        order.setCustomsDuty(orderDetails.getCustomsDuty());
        order.setShippingCost(orderDetails.getShippingCost());
        order.setDeliveryAddress(orderDetails.getDeliveryAddress());
        order.setTrackingNumber(orderDetails.getTrackingNumber());
        order.setStatus(orderDetails.getStatus());
        order.setReasonRefusal(orderDetails.getReasonRefusal());

        if (order.getItems() != null) {
            order.getItems().clear();
            for (OrderItemDTO itemDTO : orderDetails.getItems()) {
                if (itemDTO.getProductId() == null) {
                    throw new RuntimeException("Product ID cannot be null for order item");
                }

                Product product = productRepository.findById(itemDTO.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product with ID " + itemDTO.getProductId() + " not found"));

                if (itemDTO.getProductName() != null && !itemDTO.getProductName().equals(product.getName())) {
                    product.setName(itemDTO.getProductName());
                }
                if (itemDTO.getUrl() != null && !itemDTO.getUrl().equals(product.getUrl())) {
                    product.setUrl(itemDTO.getUrl());
                }
                if (itemDTO.getImageUrl() != null && !itemDTO.getImageUrl().equals(product.getImageUrl())) {
                    product.setImageUrl(itemDTO.getImageUrl());
                }
                if (itemDTO.getDescription() != null && !itemDTO.getDescription().equals(product.getDescription())) {
                    product.setDescription(itemDTO.getDescription());
                }
                productRepository.save(product);

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setOrderHistory(null);
                orderItem.setProduct(product);
                orderItem.setQuantity(itemDTO.getQuantity() != null ? itemDTO.getQuantity() : 0);
                orderItem.setPriceAtTime(itemDTO.getPriceAtTime() != null ? itemDTO.getPriceAtTime() : 0.0f);
                orderItem.setSupplierPrice(itemDTO.getSupplierPrice() != null ? itemDTO.getSupplierPrice() : 0.0f);
                order.getItems().add(orderItem);
            }
        }

        if (order.getStatus().equals("REFUSED") || order.getStatus().equals("RECEIVED")) {
            OrderHistory orderHistory = new OrderHistory();
            orderHistory.setUser(order.getUser());
            orderHistory.setOrderNumber(order.getOrderNumber());
            orderHistory.setDateCreated(order.getDateCreated());
            orderHistory.setStatus(order.getStatus());
            orderHistory.setTotalClientPrice(order.getTotalClientPrice());
            orderHistory.setDeliveryAddress(order.getDeliveryAddress());
            orderHistory.setReasonRefusal(order.getReasonRefusal());
            orderHistory.setItems(order.getItems().stream()
                    .map(item -> {
                        OrderItem historyItem = new OrderItem();
                        historyItem.setOrderHistory(orderHistory);
                        historyItem.setOrder(null);
                        historyItem.setProduct(item.getProduct());
                        historyItem.setQuantity(item.getQuantity());
                        historyItem.setPriceAtTime(item.getPriceAtTime());
                        historyItem.setSupplierPrice(item.getSupplierPrice());
                        return historyItem;
                    })
                    .collect(Collectors.toList()));
            orderHistoryRepository.save(orderHistory);

            // Send notification for refused order
            if (order.getStatus().equals("REFUSED")) {
                String refusalMessage = "Ваш заказ #" + order.getId() + " был отклонён. Причина: " + (order.getReasonRefusal() != null ? order.getReasonRefusal() : "Не указана");
                notificationService.sendOrderStatusChangeNotification(order.getUser(), order.getId(), "REFUSED");
            }

            orderRepository.delete(order);
        } else {
            orderRepository.save(order);
        }

        if (order.getStatus().equals("VERIFIED")) {
            OrderStatusEvent event = new OrderStatusEvent(order);
            kafkaTemplate.send("order-status", event.getOrder().getUser().getEmail(), event);
        }

        OrderDTO responseDTO = new OrderDTO();
        responseDTO.setId(order.getId());
        responseDTO.setOrderNumber(order.getOrderNumber());
        responseDTO.setDateCreated(order.getDateCreated());
        responseDTO.setStatus(order.getStatus());
        responseDTO.setTotalClientPrice(order.getTotalClientPrice());
        responseDTO.setDeliveryAddress(order.getDeliveryAddress());
        responseDTO.setReasonRefusal(order.getReasonRefusal());
        responseDTO.setItems(order.getItems().stream()
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

        return ResponseEntity.ok(responseDTO);
    }

    private String getCurrentUserEmail() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return null;
        }
    }

    @Data
    static class CreateOrderRequest {
        private List<CartItemDTO> cartItems;
        private String deliveryAddress;
    }

    @Data
    static class OrderDTO {
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
        private List<OrderItemDTO> items;
        private String userEmail;
        private String reasonRefusal;
    }

    @Data
    static class OrderItemDTO {
        private String productId;
        private String productName;
        private Integer quantity;
        private Float priceAtTime;
        private String url;
        private String imageUrl;
        private String description;
        private Float supplierPrice;
    }

    @Data
    static class CartItemDTO {
        private String productId;
        private String productName;
        private Double price;
        private Integer quantity;
    }
}