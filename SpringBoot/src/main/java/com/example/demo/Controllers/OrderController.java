package com.example.demo.Controllers;

import com.example.demo.Entities.*;
import com.example.demo.POJO.OrderStatusEvent;
import com.example.demo.Repositories.CartRepository;
import com.example.demo.Repositories.OrderRepository;
import com.example.demo.Repositories.ProductRepository;
import com.example.demo.Repositories.PromocodeRepository;
import com.example.demo.Repositories.UserRepository;
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
    private PromocodeRepository promocodeRepository;

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public OrderController(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<OrderDTO> createOrder(@RequestBody CreateOrderRequest request) {
        String userEmail = getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(403).body(new OrderDTO("Пользователь не аутентифицирован"));
        }

        Cart cart = cartRepository.findById(userEmail)
                .orElseThrow(() -> new RuntimeException("Корзина не найдена"));

        if (cart.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body(new OrderDTO("Корзина пуста"));
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        // Проверка временной скидки пользователя
        user.verifyDiscount();

        Order order = new Order();
        order.setUser(user);
        order.setOrderNumber(UUID.randomUUID().toString());
        order.setDateCreated(new Timestamp(System.currentTimeMillis()));
        order.setStatus("PENDING");

        // Calculate total price before discounts
        float totalClientPrice = (float) cart.getItems().stream()
                .mapToDouble(item -> item.getProduct().getPrice() * item.getQuantity())
                .sum();
        float userDiscountAmount = 0.0f;
        float promocodeDiscountAmount = 0.0f;
        float insuranceCost = 0.0f;

        // Apply user discount
        float userDiscountPercent = user.getTotalDiscount();
        if (userDiscountPercent > 0) {
            userDiscountAmount = totalClientPrice * (userDiscountPercent / 100);
        }

        // Apply promocode discount (assumed valid from frontend)
        Promocode promocode = null;
        if (request.getPromocode() != null && !request.getPromocode().isEmpty()) {
            promocode = promocodeRepository.findByCode(request.getPromocode())
                    .orElseThrow(() -> new RuntimeException("Промокод не найден"));

            // Frontend provides discountType and discountValue
            if (request.getDiscountType().equals("PERCENTAGE")) {
                promocodeDiscountAmount = totalClientPrice * (request.getDiscountValue() / 100);
            } else { // FIXED
                promocodeDiscountAmount = request.getDiscountValue();
            }
            promocode.setUsedCount(promocode.getUsedCount() + 1);
            promocodeRepository.save(promocode);
        }

        // Apply insurance cost (5% of totalClientPrice if insurance is selected)
        if (request.isInsurance()) {
            insuranceCost = totalClientPrice * 0.05f;
        }

        // Ensure final price is not negative
        float totalDiscountAmount = userDiscountAmount + promocodeDiscountAmount;
        if (totalClientPrice - totalDiscountAmount + insuranceCost < 0) {
            return ResponseEntity.badRequest().body(new OrderDTO("Скидка превышает стоимость заказа"));
        }

        // Set order details
        order.setTotalClientPrice(totalClientPrice - totalDiscountAmount + insuranceCost);
        order.setUserDiscountApplied(userDiscountAmount);
        order.setDiscountApplied(promocodeDiscountAmount);
        order.setInsuranceCost(insuranceCost);
        order.setDeliveryAddress(request.getDeliveryAddress());

        // Create and link OrderItems
        List<OrderItem> orderItems = cart.getItems().stream()
                .map(cartItem -> {
                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(order);
                    orderItem.setProduct(cartItem.getProduct());
                    orderItem.setQuantity(cartItem.getQuantity());
                    orderItem.setPriceAtTime(cartItem.getProduct().getPrice());
                    return orderItem;
                })
                .collect(Collectors.toList());

        order.setItems(orderItems);
        orderRepository.save(order);

        // Clear cart
        cart.getItems().clear();
        cartRepository.save(cart);

        // Prepare response
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setId(order.getId());
        orderDTO.setOrderNumber(order.getOrderNumber());
        orderDTO.setDateCreated(order.getDateCreated());
        orderDTO.setStatus(order.getStatus());
        orderDTO.setTotalClientPrice(order.getTotalClientPrice());
        orderDTO.setDeliveryAddress(order.getDeliveryAddress());
        orderDTO.setUserDiscountApplied(order.getUserDiscountApplied());
        orderDTO.setDiscountApplied(order.getDiscountApplied());
        orderDTO.setInsuranceCost(order.getInsuranceCost());
        orderDTO.setPromocode(order.getPromocode() != null ? order.getPromocode().getCode() : null);
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
        orderDTO.setUserEmail(user.getEmail());

        return ResponseEntity.ok(orderDTO);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) {
        String userEmail = getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(403).body(new OrderDTO("Пользователь не аутентифицирован"));
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Заказ с ID " + id + " не найден"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        boolean isOrderOwner = userEmail.equals(order.getUser().getEmail());

        if (!isAdmin && !isOrderOwner) {
            return ResponseEntity.status(403).body(new OrderDTO("Доступ запрещен"));
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
        orderDTO.setUserDiscountApplied(order.getUserDiscountApplied());
        orderDTO.setDiscountApplied(order.getDiscountApplied());
        orderDTO.setInsuranceCost(order.getInsuranceCost());
        orderDTO.setPromocode(order.getPromocode() != null ? order.getPromocode().getCode() : null);
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

        List<Order> orders = orderRepository.findAll();
        if (status != null) {
            orders = orders.stream()
                    .filter(order -> order.getStatus().equals(status))
                    .collect(Collectors.toList());
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
                    orderDTO.setUserDiscountApplied(order.getUserDiscountApplied());
                    orderDTO.setDiscountApplied(order.getDiscountApplied());
                    orderDTO.setInsuranceCost(order.getInsuranceCost());
                    orderDTO.setPromocode(order.getPromocode() != null ? order.getPromocode().getCode() : null);
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

        if (!order.getStatus().equals("PENDING")) {
            return ResponseEntity.badRequest().body(new OrderDTO("Заказ не в статусе PENDING"));
        }

        if (orderDetails.getTotalClientPrice() == null || orderDetails.getTotalClientPrice() <= 0) {
            return ResponseEntity.badRequest().body(new OrderDTO("Недопустимая итоговая цена"));
        }
        if (orderDetails.getDeliveryAddress() == null || orderDetails.getDeliveryAddress().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new OrderDTO("Адрес доставки обязателен"));
        }

        order.setTotalClientPrice(orderDetails.getTotalClientPrice());
        order.setSupplierCost(orderDetails.getSupplierCost());
        order.setCustomsDuty(orderDetails.getCustomsDuty());
        order.setShippingCost(orderDetails.getShippingCost());
        order.setDeliveryAddress(orderDetails.getDeliveryAddress());
        order.setTrackingNumber(orderDetails.getTrackingNumber());
        order.setStatus("VERIFIED");
        // Preserve userDiscountApplied and discountApplied
        order.setUserDiscountApplied(order.getUserDiscountApplied());
        order.setDiscountApplied(order.getDiscountApplied());
        order.setInsuranceCost(order.getInsuranceCost());

        OrderStatusEvent event = new OrderStatusEvent(order);
        kafkaTemplate.send("order-status", event.getOrder().getUser().getEmail(), event);

        if (orderDetails.getItems() != null) {
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
                orderItem.setProduct(product);
                orderItem.setQuantity(itemDTO.getQuantity() != null ? itemDTO.getQuantity() : 0);
                orderItem.setPriceAtTime(itemDTO.getPriceAtTime() != null ? itemDTO.getPriceAtTime() : 0.0f);
                orderItem.setSupplierPrice(itemDTO.getSupplierPrice() != null ? itemDTO.getSupplierPrice() : 0.0f);
                order.getItems().add(orderItem);
            }
        }

        orderRepository.save(order);

        OrderDTO responseDTO = new OrderDTO();
        responseDTO.setId(order.getId());
        responseDTO.setOrderNumber(order.getOrderNumber());
        responseDTO.setDateCreated(order.getDateCreated());
        responseDTO.setStatus(order.getStatus());
        responseDTO.setTotalClientPrice(order.getTotalClientPrice());
        responseDTO.setDeliveryAddress(order.getDeliveryAddress());
        responseDTO.setUserDiscountApplied(order.getUserDiscountApplied());
        responseDTO.setDiscountApplied(order.getDiscountApplied());
        responseDTO.setInsuranceCost(order.getInsuranceCost());
        responseDTO.setPromocode(order.getPromocode() != null ? order.getPromocode().getCode() : null);
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
}

@Data
class CreateOrderRequest {
    private String deliveryAddress;
    private String promocode;
    private boolean insurance;
    private String discountType;
    private Float discountValue;
}

@Data
class OrderDTO {
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
    private Float userDiscountApplied;
    private Float discountApplied;
    private Float insuranceCost;
    private String promocode;
    private List<OrderItemDTO> items;
    private String userEmail;
    private String errorMessage;

    public OrderDTO(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public OrderDTO() {}
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

@Data
class CartItemDTO {
    private String productId;
    private String productName;
    private Double price;
    private Integer quantity;
}