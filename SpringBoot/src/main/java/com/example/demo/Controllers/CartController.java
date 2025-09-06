package com.example.demo.Controllers;

import com.example.demo.DTO.CartItemDTO;
import com.example.demo.Entities.*;
import com.example.demo.Repositories.CartRepository;
import com.example.demo.Repositories.OrderRepository;
import com.example.demo.Repositories.ProductRepository;
import com.example.demo.Repositories.PromocodeRepository;
import com.example.demo.Repositories.UserRepository;
import com.example.demo.Services.UserService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PromocodeRepository promocodeRepository;

    @Autowired
    private UserService userService;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<CartItemDTO>> getCart() {
        String userEmail = userService.getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(403).body(null);
        }
        Cart cart = cartRepository.findById(userEmail).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUserEmail(userEmail);
            return cartRepository.save(newCart);
        });
        List<CartItemDTO> cartItems = cart.getItems().stream()
                .map(item -> {
                    CartItemDTO dto = new CartItemDTO();
                    dto.setId(item.getId());
                    dto.setImageUrl(item.getProduct().getImageUrl());
                    dto.setProductId(item.getProduct().getId());
                    dto.setProductName(item.getProduct().getName());
                    dto.setPrice(item.getProduct().getPrice());
                    dto.setQuantity(item.getQuantity());
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(cartItems);
    }

    @PostMapping("/bulk-add")
    @Transactional
    public ResponseEntity<List<CartItemDTO>> addBulkToCart(@RequestBody List<Product> products) {
        String userEmail = userService.getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(403).body(null);
        }

        Cart cart = cartRepository.findById(userEmail).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUserEmail(userEmail);
            return cartRepository.save(newCart);
        });

        List<Product> savedProducts = products.stream().map(product -> {
            product.setStatus("PENDING");
            product.setLastUpdated(new Timestamp(System.currentTimeMillis()));
            return productRepository.save(product);
        }).collect(Collectors.toList());

        for (Product product : savedProducts) {
            if (!cart.getItems().stream().anyMatch(item -> item.getProduct().getId().equals(product.getId()))) {
                CartItem cartItem = new CartItem();
                cartItem.setCart(cart);
                cartItem.setProduct(product);
                cartItem.setQuantity(1);
                cart.getItems().add(cartItem);
            }
        }
        cartRepository.save(cart);

        List<CartItemDTO> cartItems = cart.getItems().stream()
                .map(item -> {
                    CartItemDTO dto = new CartItemDTO();
                    dto.setId(item.getId());
                    dto.setProductId(item.getProduct().getId());
                    dto.setProductName(item.getProduct().getName());
                    dto.setPrice(item.getProduct().getPrice());
                    dto.setQuantity(item.getQuantity());
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(cartItems);
    }

    @PutMapping
    @Transactional
    public ResponseEntity<?> updateCart(@RequestBody List<CartItemRequest> items) {
        String userEmail = userService.getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(403).body(null);
        }

        Cart cart = cartRepository.findById(userEmail).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUserEmail(userEmail);
            return cartRepository.save(newCart);
        });

        if (items == null || items.isEmpty()) {
            return ResponseEntity.ok(cart.getItems().stream()
                    .map(item -> {
                        CartItemDTO dto = new CartItemDTO();
                        dto.setId(item.getId());
                        dto.setProductId(item.getProduct().getId());
                        dto.setProductName(item.getProduct().getName());
                        dto.setPrice(item.getProduct().getPrice());
                        dto.setQuantity(item.getQuantity());
                        return dto;
                    })
                    .collect(Collectors.toList()));
        }

        Map<String, CartItem> existingItems = cart.getItems().stream()
                .collect(Collectors.toMap(item -> item.getProduct().getId(), item -> item));

        for (CartItemRequest request : items) {
            if (request.getProductId() == null) {
                return ResponseEntity.badRequest().body(null);
            }
            CartItem cartItem = existingItems.get(request.getProductId());
            if (cartItem == null) {
                cartItem = new CartItem();
                cartItem.setCart(cart);
                cartItem.setProduct(productRepository.findById(request.getProductId())
                        .orElseThrow(() -> new RuntimeException("Продукт с ID " + request.getProductId() + " не найден")));
                cart.getItems().add(cartItem);
            }
            cartItem.setQuantity(request.getQuantity() != null ? Math.max(1, request.getQuantity()) : 1);
            existingItems.remove(request.getProductId());
        }

        cartRepository.save(cart);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/remove/{productId}")
    @Transactional
    public ResponseEntity<List<CartItemDTO>> removeFromCart(@PathVariable String productId) {
        String userEmail = userService.getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(403).body(null);
        }

        Cart cart = cartRepository.findById(userEmail).orElseThrow(() -> new RuntimeException("Корзина не найдена"));
        cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));
        cartRepository.save(cart);

        List<CartItemDTO> cartItems = cart.getItems().stream()
                .map(item -> {
                    CartItemDTO dto = new CartItemDTO();
                    dto.setId(item.getId());
                    dto.setProductId(item.getProduct().getId());
                    dto.setProductName(item.getProduct().getName());
                    dto.setPrice(item.getProduct().getPrice());
                    dto.setQuantity(item.getQuantity());
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(cartItems);
    }

    @DeleteMapping("/clear")
    @Transactional
    public ResponseEntity<Void> clearCart() {
        String userEmail = userService.getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(403).build();
        }

        Cart cart = cartRepository.findById(userEmail).orElseThrow(() -> new RuntimeException("Корзина не найдена"));
        cart.getItems().clear();
        cartRepository.save(cart);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/submit-order")
    @Transactional
    public ResponseEntity<?> submitOrder(@RequestBody SubmitOrderRequest request) {
        String userEmail = userService.getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(403).body(new OrderResponse("Пользователь не аутентифицирован"));
        }

        try {
            // Step 1: Get the cart
            Cart cart = cartRepository.findById(userEmail)
                    .orElseThrow(() -> new RuntimeException("Корзина не найдена"));
            if (cart.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body(new OrderResponse("Корзина пуста"));
            }

            // Step 2: Validate delivery address
            String deliveryAddress = request.getDeliveryAddress();
            if (deliveryAddress == null || deliveryAddress.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new OrderResponse("Укажите адрес доставки"));
            }

            // Step 3: Get user and verify discount
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
            user.verifyDiscount();

            // Step 4: Create order
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
                if (request.getDiscountType().equals("PERCENTAGE")) {
                    promocodeDiscountAmount = totalClientPrice * (request.getDiscountValue() / 100);
                } else { // FIXED
                    promocodeDiscountAmount = request.getDiscountValue();
                }
                order.setPromocode(promocode);
                promocode.setUsedCount(promocode.getUsedCount() + 1);
                promocodeRepository.save(promocode);
            }

            // Apply insurance cost
            if (request.isInsurance()) {
                insuranceCost = totalClientPrice * 0.05f;
            }

            // Ensure final price is not negative
            float totalDiscountAmount = userDiscountAmount + promocodeDiscountAmount;
            if (totalClientPrice - totalDiscountAmount + insuranceCost < 0) {
                return ResponseEntity.badRequest().body(new OrderResponse("Скидка превышает стоимость заказа"));
            }

            // Set order details
            order.setTotalClientPrice(totalClientPrice - totalDiscountAmount + insuranceCost);
            order.setUserDiscountApplied(userDiscountAmount);
            order.setDiscountApplied(promocodeDiscountAmount);
            order.setInsuranceCost(insuranceCost);
            order.setDeliveryAddress(deliveryAddress);

            // Step 5: Create and link OrderItems
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

            // Step 6: Update product statuses to VERIFIED
            List<Product> productsToUpdate = order.getItems().stream()
                    .map(OrderItem::getProduct)
                    .peek(product -> {
                        product.setStatus("VERIFIED");
                        product.setLastUpdated(new Timestamp(System.currentTimeMillis()));
                    })
                    .collect(Collectors.toList());
            productRepository.saveAll(productsToUpdate);

            // Step 7: Clear the cart
            cart.getItems().clear();
            cartRepository.save(cart);

            // Step 8: Prepare response
            OrderResponse response = new OrderResponse();
            response.setMessage("Заказ успешно обработан");
            response.setOrderId(order.getId());
            response.setTotalClientPrice(order.getTotalClientPrice());
            response.setUserDiscountApplied(order.getUserDiscountApplied());
            response.setDiscountApplied(order.getDiscountApplied());
            response.setInsuranceCost(order.getInsuranceCost());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new OrderResponse("Ошибка обработки заказа: " + e.getMessage()));
        }
    }
}

@Data
class CartItemRequest {
    private String productId;
    private Integer quantity;
    private String imageUrl;
    private String productName;
    private Double price;
}

@Data
class SubmitOrderRequest {
    private String deliveryAddress;
    private String promocode;
    private boolean insurance;
    private String discountType;
    private Float discountValue;
}

@Data
class OrderResponse {
    private String message;
    private Long orderId;
    private Float totalClientPrice;
    private Float userDiscountApplied; // Added for user-specific discount
    private Float discountApplied; // Promocode discount only
    private Float insuranceCost;

    public OrderResponse() {}

    public OrderResponse(String message) {
        this.message = message;
    }
}