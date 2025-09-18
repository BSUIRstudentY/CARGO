package com.example.demo.Controllers;

// [Импорты остаются без изменений, включаем все необходимые]
import com.example.demo.Entities.*;
import com.example.demo.POJO.OrderStatusEvent;
import com.example.demo.Repositories.*;
import com.example.demo.Services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import lombok.Data;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
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
    private CatalogRepository catalogRepository;

    @Autowired
    private OrderHistoryRepository orderHistoryRepository;

    @Autowired
    private NotificationService notificationService;

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public OrderController(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @PostMapping("/orders")
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
        order.setDiscountType(request.getDiscountType());
        order.setDiscountValue(request.getDiscountValue());
        order.setInsurance(request.getInsurance() != null ? request.getInsurance() : false);

        List<OrderItem> orderItems = cart.getItems().stream()
                .map(cartItem -> {
                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(order);
                    orderItem.setProduct(cartItem.getProduct());
                    orderItem.setQuantity(cartItem.getQuantity());
                    orderItem.setPriceAtTime(cartItem.getProduct().getPrice());
                    orderItem.setPurchaseStatus("PENDING");
                    return orderItem;
                })
                .collect(Collectors.toList());

        order.setItems(orderItems);
        orderRepository.save(order);

        cart.getItems().clear();
        cartRepository.save(cart);

        OrderDTO orderDTO = mapToOrderDTO(order);
        return ResponseEntity.ok(orderDTO);
    }

    @GetMapping("/orders/{id}")
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

        OrderDTO orderDTO = mapToOrderDTO(order);
        return ResponseEntity.ok(orderDTO);
    }

    @GetMapping("/orders")
    @Transactional(readOnly = true)
    public ResponseEntity<PagedResponse<OrderDTO>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dateCreated,desc") String sort,
            @RequestParam(required = false) String status) {

        String userEmail = getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(403).body(null);
        }

        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction sortDirection = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")
                ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortField));

        Page<Order> orderPage;
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (status != null && !status.equals("ALL")) {
            if (status.contains(",")) {
                String[] statuses = status.split(",");
                if (!isAdmin) {
                    orderPage = orderRepository.findByStatusNotInAndUserEmail(List.of(statuses), userEmail, pageable);
                } else {
                    orderPage = orderRepository.findByStatusIn(List.of(statuses), pageable);
                }
            } else {
                if (!isAdmin) {
                    orderPage = orderRepository.findByUserEmailAndStatus(userEmail, status, pageable);
                } else {
                    orderPage = orderRepository.findByStatus(status, pageable);
                }
            }
        } else {
            if (!isAdmin) {
                orderPage = orderRepository.findByStatusNotInAndUserEmail(
                        List.of("REFUSED", "RECEIVED"), userEmail, pageable);
            } else {
                orderPage = orderRepository.findByStatusNotIn(List.of("REFUSED", "RECEIVED"), pageable);
            }
        }

        List<OrderDTO> orderDTOs = orderPage.getContent().stream()
                .map(this::mapToOrderDTO)
                .collect(Collectors.toList());

        PagedResponse<OrderDTO> response = new PagedResponse<>(
                orderDTOs,
                orderPage.getNumber(),
                orderPage.getSize(),
                orderPage.getTotalElements(),
                orderPage.getTotalPages(),
                orderPage.isLast()
        );

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/orders/{id}")
    @Transactional
    public ResponseEntity<?> verifyOrder(@PathVariable Long id, @RequestBody OrderDTO orderDetails) {
        System.out.println("Processing PUT /api/orders/" + id + " for user: " + getCurrentUserEmail());
        System.out.println("Request body: " + orderDetails);

        if (orderDetails == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Request body cannot be null", 400));
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Заказ с ID " + id + " не найден"));

        if (orderDetails.getTotalClientPrice() == null || orderDetails.getTotalClientPrice() <= 0) {
            System.out.println("Validation failed: totalClientPrice is null or <= 0");
            return ResponseEntity.badRequest().body(new ErrorResponse("Общая цена для клиента должна быть больше 0", 400));
        }
        if (orderDetails.getDeliveryAddress() == null || orderDetails.getDeliveryAddress().trim().isEmpty()) {
            System.out.println("Validation failed: deliveryAddress is null or empty");
            return ResponseEntity.badRequest().body(new ErrorResponse("Адрес доставки обязателен", 400));
        }

        // Обновление полей заказа
        order.setTotalClientPrice(orderDetails.getTotalClientPrice());
        order.setSupplierCost(orderDetails.getSupplierCost() != null ? orderDetails.getSupplierCost() : 0.0f);
        order.setCustomsDuty(orderDetails.getCustomsDuty() != null ? orderDetails.getCustomsDuty() : 0.0f);
        order.setShippingCost(orderDetails.getShippingCost() != null ? orderDetails.getShippingCost() : 0.0f);
        order.setDeliveryAddress(orderDetails.getDeliveryAddress());
        order.setTrackingNumber(orderDetails.getTrackingNumber());
        order.setStatus(orderDetails.getStatus() != null ? orderDetails.getStatus() : "PENDING");
        order.setReasonRefusal(orderDetails.getReasonRefusal());
        order.setInsurance(orderDetails.getInsurance() != null ? orderDetails.getInsurance() : false);
        order.setDiscountType(orderDetails.getDiscountType());
        order.setDiscountValue(orderDetails.getDiscountValue());
        order.setInsuranceCost(orderDetails.getInsuranceCost() != null ? orderDetails.getInsuranceCost() : 0.0f);
        order.setUserDiscountApplied(orderDetails.getUserDiscountApplied() != null ? orderDetails.getUserDiscountApplied() : 0.0f);

        // Пересчёт totalClientPrice
        float totalClientPrice = 0.0f;
        float userDiscountAmount = order.getUserDiscountApplied() != null ? order.getUserDiscountApplied() : 0.0f;
        float promocodeDiscountAmount = order.getDiscountApplied() != null ? order.getDiscountApplied() : 0.0f;
        float insuranceCost = order.getInsuranceCost() != null ? order.getInsuranceCost() : 0.0f;

        if (orderDetails.getItems() != null && !orderDetails.getItems().isEmpty()) {
            totalClientPrice = (float) orderDetails.getItems().stream()
                    .mapToDouble(item -> (item.getPriceAtTime() != null ? item.getPriceAtTime() : 0.0f) * (item.getQuantity() != null ? item.getQuantity() : 1))
                    .sum();
        } else {
            totalClientPrice = (float) order.getItems().stream()
                    .mapToDouble(item -> (item.getPriceAtTime() != null ? item.getPriceAtTime() : 0.0f) * (item.getQuantity() != null ? item.getQuantity() : 1))
                    .sum();
        }

        // Применение скидок пользователя
        User user = order.getUser();
        if (user != null) {
            user.verifyDiscount();
            float userDiscountPercent = user.getTotalDiscount();
            if (userDiscountPercent > 0) {
                userDiscountAmount = totalClientPrice * (userDiscountPercent / 100);
                order.setUserDiscountApplied(userDiscountAmount);
            }
        }

        // Применение промокода
        Promocode promocode = order.getPromocode();
        if (promocode != null) {
            if (!promocode.getIsActive() ||
                    LocalDateTime.now().isBefore(promocode.getValidFrom()) ||
                    LocalDateTime.now().isAfter(promocode.getValidUntil()) ||
                    (promocode.getUsageLimit() != null && promocode.getUsedCount() >= promocode.getUsageLimit())) {
                order.setPromocode(null);
                order.setDiscountApplied(0.0f);
                promocodeDiscountAmount = 0.0f;
            } else {
                if (promocode.getDiscountType() == DiscountType.PERCENTAGE) {
                    promocodeDiscountAmount = totalClientPrice * (promocode.getDiscountValue() / 100);
                } else {
                    promocodeDiscountAmount = promocode.getDiscountValue();
                }
                order.setDiscountApplied(promocodeDiscountAmount);
            }
        }

        // Применение страховки
        boolean hasInsurance = order.getInsurance() != null && order.getInsurance();
        if (hasInsurance) {
            insuranceCost = totalClientPrice * 0.05f;
            order.setInsuranceCost(insuranceCost);
        }

        float totalDiscountAmount = userDiscountAmount + promocodeDiscountAmount;
        float finalPrice = totalClientPrice - totalDiscountAmount + insuranceCost;
        if (finalPrice < 0) {
            System.out.println("Validation failed: final price is negative");
            return ResponseEntity.badRequest().body(new ErrorResponse("Скидка превышает стоимость заказа", 400));
        }

        order.setTotalClientPrice(finalPrice);

        // Обновление элементов заказа
        if (order.getItems() != null) {
            order.getItems().clear();
        }
        if (orderDetails.getItems() != null) {
            for (OrderItemDTO itemDTO : orderDetails.getItems()) {
                if (itemDTO.getProductId() == null) {
                    System.out.println("Validation failed: productId is null for item " + itemDTO);
                    return ResponseEntity.badRequest().body(new ErrorResponse("Product ID cannot be null for order item", 400));
                }

                Product product = productRepository.findById(UUID.fromString(itemDTO.getProductId()))
                        .orElseThrow(() -> new RuntimeException("Product with ID " + itemDTO.getProductId() + " not found"));

                // Обновление данных продукта
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
                orderItem.setProduct(product);
                orderItem.setQuantity(itemDTO.getQuantity() != null ? itemDTO.getQuantity() : 1);
                orderItem.setPriceAtTime(itemDTO.getPriceAtTime() != null ? itemDTO.getPriceAtTime() : product.getPrice());
                orderItem.setSupplierPrice(itemDTO.getSupplierPrice() != null ? itemDTO.getSupplierPrice() : 0.0f);
                orderItem.setPurchaseStatus(itemDTO.getPurchaseStatus() != null ? itemDTO.getPurchaseStatus() : "PENDING");
                orderItem.setPurchaseRefusalReason(itemDTO.getPurchaseRefusalReason());
                orderItem.setTrackingNumber(itemDTO.getTrackingNumber());
                orderItem.setChinaDeliveryPrice(itemDTO.getChinaDeliveryPrice() != null ? itemDTO.getChinaDeliveryPrice() : 0.0f);

                if (orderDetails.getTotalClientPrice() > 0 && !catalogRepository.existsByProductId(itemDTO.getProductId())) {
                    Catalog catalog = new Catalog();
                    catalog.setProduct(product);
                    catalogRepository.save(catalog);
                }

                order.getItems().add(orderItem);
            }
        }

        // Уведомления для невыкупленных товаров
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                if ("NOT_PURCHASED".equals(item.getPurchaseStatus()) && item.getPurchaseRefusalReason() != null) {
                    try {
                        notificationService.sendOrderItemStatusChangeNotification(
                                order.getUser(),
                                order.getId(),
                                item.getProduct().getName(),
                                item.getPurchaseRefusalReason()
                        );
                    } catch (Exception e) {
                        System.out.println("Failed to send item notification for " + item.getProduct().getName() + ": " + e.getMessage());
                    }
                }
            }
        }

        // Обработка завершённых заказов
        if (order.getStatus().equals("REFUSED") || order.getStatus().equals("RECEIVED")) {
            OrderHistory orderHistory = new OrderHistory();
            orderHistory.setUser(order.getUser());
            orderHistory.setOrderNumber(order.getOrderNumber());
            orderHistory.setDateCreated(order.getDateCreated());
            orderHistory.setStatus(order.getStatus());
            orderHistory.setTotalClientPrice(order.getTotalClientPrice());
            orderHistory.setDeliveryAddress(order.getDeliveryAddress());
            orderHistory.setReasonRefusal(order.getReasonRefusal());
            orderHistory.setSupplierCost(order.getSupplierCost());
            orderHistory.setCustomsDuty(order.getCustomsDuty());
            orderHistory.setShippingCost(order.getShippingCost());
            orderHistory.setTrackingNumber(order.getTrackingNumber());
            orderHistory.setInsurance(order.getInsurance());
            orderHistory.setDiscountType(order.getDiscountType());
            orderHistory.setDiscountValue(order.getDiscountValue());
            orderHistory.setPromocode(order.getPromocode());
            orderHistory.setItems(order.getItems().stream()
                    .map(item -> {
                        OrderItem historyItem = new OrderItem();
                        historyItem.setOrderHistory(orderHistory);
                        historyItem.setOrder(null);
                        historyItem.setProduct(item.getProduct());
                        historyItem.setQuantity(item.getQuantity());
                        historyItem.setPriceAtTime(item.getPriceAtTime());
                        historyItem.setSupplierPrice(item.getSupplierPrice());
                        historyItem.setPurchaseStatus(item.getPurchaseStatus());
                        historyItem.setPurchaseRefusalReason(item.getPurchaseRefusalReason());
                        historyItem.setTrackingNumber(item.getTrackingNumber());
                        historyItem.setChinaDeliveryPrice(item.getChinaDeliveryPrice());
                        return historyItem;
                    })
                    .collect(Collectors.toList()));
            orderHistoryRepository.save(orderHistory);

            try {
                if (order.getStatus().equals("REFUSED")) {
                    notificationService.sendOrderStatusChangeNotification(order.getUser(), order.getId(), "REFUSED");
                } else if (order.getStatus().equals("RECEIVED")) {
                    notificationService.sendOrderStatusChangeNotification(order.getUser(), order.getId(), "RECEIVED");
                }
            } catch (Exception e) {
                System.out.println("Failed to send notification: " + e.getMessage());
            }

            orderRepository.delete(order);
        } else {
            orderRepository.save(order);
        }

        if (order.getStatus().equals("VERIFIED")) {
            try {
                OrderStatusEvent event = new OrderStatusEvent(order);
                event.getOrder().setUser(order.getUser());
                kafkaTemplate.send("order-status", event.getOrder().getUser().getEmail(), event);
            } catch (Exception e) {
                System.out.println("Failed to send Kafka message: " + e.getMessage());
            }
        }

        OrderDTO responseDTO = mapToOrderDTO(order);
        System.out.println("Returning response: " + responseDTO);
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/history/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<OrderHistoryDTO> getOrderHistoryById(@PathVariable Long id) {
        String userEmail = getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(403).body(null);
        }

        OrderHistory order = orderHistoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Заказ с ID " + id + " не найден в истории"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        boolean isOrderOwner = userEmail.equals(order.getUser().getEmail());

        if (!isAdmin && !isOrderOwner) {
            return ResponseEntity.status(403).body(null);
        }

        OrderHistoryDTO orderDTO = new OrderHistoryDTO();
        orderDTO.setId(order.getId());
        orderDTO.setOrderNumber(order.getOrderNumber());
        orderDTO.setDateCreated(order.getDateCreated());
        orderDTO.setStatus(order.getStatus());
        orderDTO.setTotalClientPrice(order.getTotalClientPrice());
        orderDTO.setDeliveryAddress(order.getDeliveryAddress());
        orderDTO.setReasonRefusal(order.getReasonRefusal());
        orderDTO.setSupplierCost(order.getSupplierCost());
        orderDTO.setCustomsDuty(order.getCustomsDuty());
        orderDTO.setShippingCost(order.getShippingCost());
        orderDTO.setTrackingNumber(order.getTrackingNumber());
        orderDTO.setInsurance(order.getInsurance());
        orderDTO.setDiscountType(order.getDiscountType());
        orderDTO.setDiscountValue(order.getDiscountValue());
        orderDTO.setPromocode(order.getPromocode() != null ? order.getPromocode().getCode() : null);
        orderDTO.setItems(order.getItems().stream()
                .map(item -> {
                    OrderItemDTO itemDTO = new OrderItemDTO();
                    itemDTO.setId(item.getId());
                    itemDTO.setProductId(item.getProduct().getId().toString());
                    itemDTO.setProductName(item.getProduct().getName());
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setPriceAtTime(item.getPriceAtTime());
                    itemDTO.setUrl(item.getProduct().getUrl());
                    itemDTO.setImageUrl(item.getProduct().getImageUrl() != null ? item.getProduct().getImageUrl() : "https://placehold.co/128x128?text=No+Image");
                    itemDTO.setDescription(item.getProduct().getDescription());
                    itemDTO.setSupplierPrice(item.getSupplierPrice());
                    itemDTO.setPurchaseStatus(item.getPurchaseStatus());
                    itemDTO.setPurchaseRefusalReason(item.getPurchaseRefusalReason());
                    itemDTO.setTrackingNumber(item.getTrackingNumber());
                    itemDTO.setChinaDeliveryPrice(item.getChinaDeliveryPrice());
                    return itemDTO;
                })
                .collect(Collectors.toList()));
        orderDTO.setUserEmail(order.getUser().getEmail());

        return ResponseEntity.ok(orderDTO);
    }

    private OrderDTO mapToOrderDTO(Order order) {
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
        orderDTO.setInsurance(order.getInsurance());
        orderDTO.setDiscountType(order.getDiscountType());
        orderDTO.setDiscountValue(order.getDiscountValue());
        orderDTO.setPromocode(order.getPromocode() != null ? order.getPromocode().getCode() : null);
        orderDTO.setInsuranceCost(order.getInsuranceCost());
        orderDTO.setUserDiscountApplied(order.getUserDiscountApplied());

        orderDTO.setItems(order.getItems().stream()
                .map(item -> {
                    OrderItemDTO itemDTO = new OrderItemDTO();
                    itemDTO.setId(item.getId());
                    itemDTO.setProductId(item.getProduct().getId().toString());
                    itemDTO.setProductName(item.getProduct().getName());
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setPriceAtTime(item.getPriceAtTime());
                    itemDTO.setUrl(item.getProduct().getUrl());
                    itemDTO.setImageUrl(item.getProduct().getImageUrl() != null ? item.getProduct().getImageUrl() : "https://placehold.co/128x128?text=No+Image");
                    itemDTO.setDescription(item.getProduct().getDescription());
                    itemDTO.setSupplierPrice(item.getSupplierPrice());
                    itemDTO.setPurchaseStatus(item.getPurchaseStatus());
                    itemDTO.setPurchaseRefusalReason(item.getPurchaseRefusalReason());
                    itemDTO.setTrackingNumber(item.getTrackingNumber());
                    itemDTO.setChinaDeliveryPrice(item.getChinaDeliveryPrice());
                    return itemDTO;
                })
                .collect(Collectors.toList()));
        orderDTO.setUserEmail(order.getUser().getEmail());
        return orderDTO;
    }

    private String getCurrentUserEmail() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            System.out.println("User: " + email + ", Authorities: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
            return email;
        } catch (Exception e) {
            System.out.println("Error getting user email: " + e.getMessage());
            return null;
        }
    }

    @Data
    static class CreateOrderRequest {
        private List<CartItemDTO> cartItems;
        private String deliveryAddress;
        private String promocode;
        private Boolean insurance;
        private String discountType;
        private Float discountValue;
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
        private Boolean insurance;
        private String discountType;
        private Float discountValue;
        private String promocode;
        private Float insuranceCost;
        private Float userDiscountApplied;
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
        private List<OrderItemDTO> items;
        private String userEmail;
        private String reasonRefusal;
        private Boolean insurance;
        private String discountType;
        private Float discountValue;
        private String promocode;
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

    @Data
    static class CartItemDTO {
        private String productId;
        private String productName;
        private Double price;
        private Integer quantity;
    }

    @Data
    static class ErrorResponse {
        private String message;
        private int status;

        public ErrorResponse(String message, int status) {
            this.message = message;
            this.status = status;
        }
    }
}