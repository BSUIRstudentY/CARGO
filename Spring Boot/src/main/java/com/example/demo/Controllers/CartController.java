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
import jakarta.persistence.EntityManager;
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
    private EntityManager entityManager;

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
            // Проверяем, существует ли товар в БД
            Product existingProduct = productRepository.findById(product.getId()).orElse(null);
            
            if (existingProduct != null) {
                // Товар уже существует, обновляем его
                existingProduct.setStatus("PENDING");
                existingProduct.setLastUpdated(new Timestamp(System.currentTimeMillis()));
                // Обновляем поля, если они были изменены
                if (product.getName() != null) existingProduct.setName(product.getName());
                if (product.getUrl() != null) existingProduct.setUrl(product.getUrl());
                if (product.getPrice() != null) existingProduct.setPrice(product.getPrice());
                if (product.getImageUrl() != null) existingProduct.setImageUrl(product.getImageUrl());
                if (product.getDescription() != null) existingProduct.setDescription(product.getDescription());
                Product saved = productRepository.save(existingProduct);
                entityManager.flush(); // Принудительно записываем в БД
                return saved;
            } else {
                // Новый товар, сохраняем его
                product.setStatus("PENDING");
                product.setLastUpdated(new Timestamp(System.currentTimeMillis()));
                // Устанавливаем обязательные поля, если они не заданы
                if (product.getStatus() == null) product.setStatus("PENDING");
                if (product.getOriginCountry() == null) product.setOriginCountry("China");
                if (product.getSalesCount() == null) product.setSalesCount(0);
                if (product.getTotalReviewSumm() == null) product.setTotalReviewSumm(0);
                if (product.getReviewQuantity() == null) product.setReviewQuantity(0);
                Product saved = productRepository.save(product);
                entityManager.flush(); // Принудительно записываем в БД
                return saved;
            }
        }).collect(Collectors.toList());
        
        // Дополнительный flush для всех товаров перед созданием CartItem
        entityManager.flush();

        // Убеждаемся, что все товары сохранены перед добавлением в корзину
        // Используем сохраненные товары напрямую, так как они уже в контексте транзакции
        for (Product product : savedProducts) {
            // Проверяем, что товар не дублируется в корзине
            boolean alreadyInCart = cart.getItems().stream()
                    .anyMatch(item -> item.getProduct().getId().equals(product.getId()));
            
            if (!alreadyInCart) {
                CartItem cartItem = new CartItem();
                cartItem.setCart(cart);
                cartItem.setProduct(product); // Используем сохраненный товар из контекста транзакции
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
            float finalTotal = totalClientPrice - totalDiscountAmount + insuranceCost;
            order.setTotalClientPrice(finalTotal);
            order.setUserDiscountApplied(userDiscountAmount);
            order.setDiscountApplied(promocodeDiscountAmount);
            order.setInsuranceCost(insuranceCost);
            order.setDeliveryAddress(deliveryAddress);

            // Step 5: Handle payment method and balance reservation
            String paymentMethod = request.getPaymentMethod() != null ? request.getPaymentMethod() : "NO_BALANCE";
            float balanceToReserve = 0.0f;
            float availableBalance = user.getBalance() - (user.getReservedBalance() != null ? user.getReservedBalance() : 0.0f);

            if ("BALANCE_ONLY".equals(paymentMethod)) {
                // Полная оплата с баланса
                if (availableBalance < finalTotal) {
                    return ResponseEntity.badRequest().body(new OrderResponse("Недостаточно средств на балансе. Доступно: ¥" + availableBalance + ", требуется: ¥" + finalTotal));
                }
                balanceToReserve = finalTotal;
                order.setBalanceAmount(finalTotal);
            } else if ("BALANCE_PARTIAL".equals(paymentMethod)) {
                // Частичная оплата с баланса
                float requestedBalanceAmount = request.getBalanceAmount() != null ? request.getBalanceAmount() : 0.0f;
                if (requestedBalanceAmount <= 0 || requestedBalanceAmount > finalTotal) {
                    return ResponseEntity.badRequest().body(new OrderResponse("Неверная сумма для оплаты с баланса"));
                }
                if (availableBalance < requestedBalanceAmount) {
                    return ResponseEntity.badRequest().body(new OrderResponse("Недостаточно средств на балансе. Доступно: ¥" + availableBalance + ", требуется: ¥" + requestedBalanceAmount));
                }
                balanceToReserve = requestedBalanceAmount;
                order.setBalanceAmount(requestedBalanceAmount);
            } else {
                // NO_BALANCE - оплата не с баланса
                order.setBalanceAmount(0.0f);
            }

            order.setPaymentMethod(paymentMethod);

            // Резервируем средства на балансе
            if (balanceToReserve > 0) {
                float currentReserved = user.getReservedBalance() != null ? user.getReservedBalance() : 0.0f;
                user.setReservedBalance(currentReserved + balanceToReserve);
                userRepository.save(user);
            }

            // Step 6: Create and link OrderItems
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

            // Step 7: Update product statuses to VERIFIED
            List<Product> productsToUpdate = order.getItems().stream()
                    .map(OrderItem::getProduct)
                    .peek(product -> {
                        product.setStatus("VERIFIED");
                        product.setLastUpdated(new Timestamp(System.currentTimeMillis()));
                    })
                    .collect(Collectors.toList());
            productRepository.saveAll(productsToUpdate);

            // Step 8: Clear the cart
            cart.getItems().clear();
            cartRepository.save(cart);

            // Step 9: Prepare response
            OrderResponse response = new OrderResponse();
            response.setMessage("Заказ успешно обработан");
            response.setOrderId(order.getId());
            response.setTotalClientPrice(order.getTotalClientPrice());
            response.setUserDiscountApplied(order.getUserDiscountApplied());
            response.setDiscountApplied(order.getDiscountApplied());
            response.setInsuranceCost(order.getInsuranceCost());
            response.setPaymentMethod(order.getPaymentMethod());
            response.setBalanceAmount(order.getBalanceAmount());
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

class SubmitOrderRequest {
    private String deliveryAddress;
    private String promocode;
    private boolean insurance;
    private String discountType;
    private Float discountValue;
    private String paymentMethod; // BALANCE_ONLY, NO_BALANCE, BALANCE_PARTIAL
    private Float balanceAmount; // Сумма для оплаты с баланса (для BALANCE_PARTIAL)
    private String packaging; // Тип упаковки

    // Constructors
    public SubmitOrderRequest() {
    }

    // Getters
    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public String getPromocode() {
        return promocode;
    }

    public boolean isInsurance() {
        return insurance;
    }

    public String getDiscountType() {
        return discountType;
    }

    public Float getDiscountValue() {
        return discountValue;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public Float getBalanceAmount() {
        return balanceAmount;
    }

    public String getPackaging() {
        return packaging;
    }

    // Setters
    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public void setPromocode(String promocode) {
        this.promocode = promocode;
    }

    public void setInsurance(boolean insurance) {
        this.insurance = insurance;
    }

    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }

    public void setDiscountValue(Float discountValue) {
        this.discountValue = discountValue;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public void setBalanceAmount(Float balanceAmount) {
        this.balanceAmount = balanceAmount;
    }

    public void setPackaging(String packaging) {
        this.packaging = packaging;
    }
}

@Data
class OrderResponse {
    private String message;
    private Long orderId;
    private Float totalClientPrice;
    private Float userDiscountApplied; // Added for user-specific discount
    private Float discountApplied; // Promocode discount only
    private Float insuranceCost;
    private String paymentMethod; // BALANCE_ONLY, NO_BALANCE, BALANCE_PARTIAL
    private Float balanceAmount; // Сумма, оплаченная с баланса

    public OrderResponse() {}

    public OrderResponse(String message) {
        this.message = message;
    }
}