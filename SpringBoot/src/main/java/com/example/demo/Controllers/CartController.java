package com.example.demo.Controllers;

import com.example.demo.DTO.CartItemDTO;
import com.example.demo.Entities.Cart;
import com.example.demo.Entities.CartItem;

import com.example.demo.Entities.Product;
import com.example.demo.Repositories.CartRepository;
import com.example.demo.Repositories.ProductRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

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
    public ResponseEntity<List<CartItemDTO>> updateCart(@RequestBody List<CartItemRequest> items) {
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
            cart.getItems().clear();
            cartRepository.save(cart);
            return ResponseEntity.ok(List.of());
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

        cart.getItems().removeAll(existingItems.values());
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
}