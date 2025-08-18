package com.example.demo.Controllers;

import com.example.demo.DTO.CartItemDTO;
import com.example.demo.Entities.*;
import com.example.demo.Repositories.CartRepository;
import com.example.demo.Repositories.OrderRepository;
import com.example.demo.Repositories.ProductRepository;
import com.example.demo.Repositories.UserRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<CartItemDTO>> getCart() {
        String userEmail = getCurrentUserEmail();
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
        String userEmail = getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(403).body(null);
        }

        Cart cart = cartRepository.findById(userEmail).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUserEmail(userEmail);
            return cartRepository.save(newCart);
        });

        // Сохраняем или обновляем продукты с статусом PENDING
        List<Product> savedProducts = products.stream().map(product -> {
            product.setStatus("PENDING");
            product.setLastUpdated(new Timestamp(System.currentTimeMillis()));
            return productRepository.save(product);
        }).collect(Collectors.toList());

        // Добавляем в корзину только новые товары
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
        String userEmail = getCurrentUserEmail();
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

        // Не удаляем оставшиеся элементы, только обновляем существующие
        cartRepository.save(cart);



        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/remove/{productId}")
    @Transactional
    public ResponseEntity<List<CartItemDTO>> removeFromCart(@PathVariable String productId) {
        String userEmail = getCurrentUserEmail();
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
        String userEmail = getCurrentUserEmail();
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
    public ResponseEntity<?> submitOrder(@RequestBody Map<String, Object> request) {
        String userEmail = getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(403).body(null);
        }

        try {
            // Шаг 1: Получаем корзину
            Cart cart = cartRepository.findById(userEmail)
                    .orElseThrow(() -> new RuntimeException("Корзина не найдена"));
            if (cart.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Корзина пуста"));
            }

            // Шаг 2: Получаем адрес доставки из запроса
            String deliveryAddress = (String) request.get("deliveryAddress");
            if (deliveryAddress == null || deliveryAddress.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Укажите адрес доставки"));
            }

            // Шаг 3: Создаём заказ
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
            order.setDeliveryAddress(deliveryAddress);

            // Шаг 4: Создаём и связываем OrderItem с Order
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
            orderRepository.save(order); // Сохранение заказа с каскадным сохранением OrderItem

            // Шаг 5: Обновляем статус продуктов на VERIFIED
            List<Product> productsToUpdate = order.getItems().stream()
                    .map(orderItem -> orderItem.getProduct())
                    .peek(product -> {
                        product.setStatus("VERIFIED");
                        product.setLastUpdated(new Timestamp(System.currentTimeMillis()));
                    })
                    .collect(Collectors.toList());
            productRepository.saveAll(productsToUpdate);

            // Шаг 6: Очищаем корзину
            cart.getItems().clear();
            cartRepository.save(cart);

            return ResponseEntity.ok(Map.of("message", "Заказ успешно обработан", "orderId", order.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Ошибка обработки заказа: " + e.getMessage()));
        }
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
class CartItemRequest {
    private String productId;
    private Integer quantity;
    private String imageUrl;    // Add this
    private String productName; // Add this
    private Double price;       // Add this (adjust type based on your needs)
}