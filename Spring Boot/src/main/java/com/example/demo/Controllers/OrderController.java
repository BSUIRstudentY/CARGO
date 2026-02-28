package com.example.demo.Controllers;

import com.example.demo.Entities.*;
import com.example.demo.Repositories.*;
import com.example.demo.Services.NotificationService;
import com.example.demo.Services.GmailSenderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.persistence.EntityNotFoundException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class OrderController {
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

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
    private NotificationService notificationService;

    @Autowired
    private GmailSenderService gmailSenderService;

    // Новый эндпоинт для создания заказа с трек-номерами
    @PostMapping("/orders/self-pickup")
    @Transactional
    public ResponseEntity<OrderDTO> createSelfPickupOrder(@RequestBody SelfPickupOrderRequest request) {
        try {
            logger.info("Creating self-pickup order. Request: trackingNumbers={}, deliveryAddress={}, warehouseIdFinish={}", 
                    request.getTrackingNumbers(), request.getDeliveryAddress(), request.getWarehouseIdFinish());
            
            String userEmail = getCurrentUserEmail();
            if (userEmail == null) {
                logger.warn("Self-pickup order creation failed: user not authenticated");
                return ResponseEntity.status(403).body(null);
            }

            // Валидация входных данных
            if (request.getTrackingNumbers() == null || request.getTrackingNumbers().isEmpty()) {
                logger.warn("Self-pickup order creation failed: trackingNumbers is null or empty");
                return ResponseEntity.badRequest().body(new OrderDTO());
            }

            if (request.getDeliveryAddress() == null || request.getDeliveryAddress().trim().isEmpty()) {
                logger.warn("Self-pickup order creation failed: deliveryAddress is null or empty");
                return ResponseEntity.badRequest().body(new OrderDTO());
            }

            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

            // Создание заказа
            Order order = new Order();
            order.setUser(user);
            order.setOrderNumber(UUID.randomUUID().toString());
            order.setDateCreated(new Timestamp(System.currentTimeMillis()));
            order.setStatus("PENDING");
            order.setTotalClientPrice(0.0f); // Пока 0, так как цены неизвестны
            order.setDeliveryAddress(request.getDeliveryAddress());

            // Создание OrderItem для каждого трек-номера
            List<OrderItem> orderItems = request.getTrackingNumbers().stream()
                    .map(trackingNumber -> {
                        OrderItem orderItem = new OrderItem();
                        orderItem.setOrder(order);
                        orderItem.setTrackingNumber(trackingNumber);
                        orderItem.setPurchaseStatus("PENDING");
                        orderItem.setQuantity(1); // По умолчанию 1, так как товар неизвестен
                        orderItem.setPriceAtTime(0.0f); // Цена неизвестна
                        // Поле product временно null, так как товар неизвестен
                        return orderItem;
                    })
                    .collect(Collectors.toList());

            order.setItems(orderItems);
            Order savedOrder = orderRepository.save(order);
            logger.info("Self-pickup order created successfully. Order ID: {}", savedOrder.getId());

            OrderDTO orderDTO = mapToOrderDTO(savedOrder);
            return ResponseEntity.ok(orderDTO);
        } catch (Exception e) {
            logger.error("Error creating self-pickup order: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new OrderDTO());
        }
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
        order.setPhone(request.getPhone());
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
            // Для админа показываем все заказы, для пользователя - все кроме удаленных
            if (!isAdmin) {
                orderPage = orderRepository.findByUserEmail(userEmail, pageable);
            } else {
                // Для админа показываем все заказы
                orderPage = orderRepository.findAll(pageable);
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
        logger.debug("Processing PUT /api/orders/{} for user: {}", id, getCurrentUserEmail());

        if (orderDetails == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Request body cannot be null", 400));
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Заказ с ID " + id + " не найден"));

        // Проверка обязательных полей (totalClientPrice будет пересчитан автоматически)
        if (orderDetails.getDeliveryAddress() == null || orderDetails.getDeliveryAddress().trim().isEmpty()) {
            logger.warn("Validation failed for order {}: deliveryAddress is null or empty", id);
            return ResponseEntity.badRequest().body(new ErrorResponse("Адрес доставки обязателен", 400));
        }

        // Обновление полей заказа (кроме totalClientPrice - он будет пересчитан)
        order.setSupplierCost(orderDetails.getSupplierCost() != null ? orderDetails.getSupplierCost() : 0.0f);
        order.setCustomsDuty(orderDetails.getCustomsDuty() != null ? orderDetails.getCustomsDuty() : 0.0f);
        order.setShippingCost(orderDetails.getShippingCost() != null ? orderDetails.getShippingCost() : 0.0f);
        order.setDeliveryAddress(orderDetails.getDeliveryAddress());
        order.setTrackingNumber(orderDetails.getTrackingNumber());
        if (orderDetails.getChinaTrackingNumber() != null) {
            order.setChinaTrackingNumber(orderDetails.getChinaTrackingNumber());
        }
        if (orderDetails.getInternationalTrackingNumber() != null) {
            order.setInternationalTrackingNumber(orderDetails.getInternationalTrackingNumber());
        }
        if (orderDetails.getLocalTrackingNumber() != null) {
            order.setLocalTrackingNumber(orderDetails.getLocalTrackingNumber());
        }
        if (orderDetails.getWeight() != null) {
            order.setWeight(orderDetails.getWeight());
        }
        if (orderDetails.getCustomsStatus() != null) {
            order.setCustomsStatus(orderDetails.getCustomsStatus());
        }
        order.setStatus(orderDetails.getStatus() != null ? orderDetails.getStatus() : "PENDING");
        order.setReasonRefusal(orderDetails.getReasonRefusal());
        // ВАЖНО: обновляем страховку только если она явно передана в DTO, иначе сохраняем текущее значение
        if (orderDetails.getInsurance() != null) {
            order.setInsurance(orderDetails.getInsurance());
        }
        // Если insurance не передан, сохраняем текущее значение из order
        order.setDiscountType(orderDetails.getDiscountType());
        order.setDiscountValue(orderDetails.getDiscountValue());
        // Обновление контактных данных клиента
        if (orderDetails.getPhone() != null) {
            order.setPhone(orderDetails.getPhone());
        }
        if (orderDetails.getLastName() != null) {
            order.setLastName(orderDetails.getLastName());
        }
        if (orderDetails.getFirstName() != null) {
            order.setFirstName(orderDetails.getFirstName());
        }
        if (orderDetails.getMiddleName() != null) {
            order.setMiddleName(orderDetails.getMiddleName());
        }

        // Обновление элементов заказа (ПЕРЕД пересчётом, чтобы использовать актуальные цены)
        // ВАЖНО: очищаем старые items и создаём новые, чтобы гарантировать пересчёт
        if (order.getItems() != null) {
            logger.debug("Order {} clearing {} old items before update", id, order.getItems().size());
            order.getItems().clear();
        }
        if (orderDetails.getItems() != null) {
            logger.debug("Order {} updating {} items", id, orderDetails.getItems().size());
            for (OrderItemDTO itemDTO : orderDetails.getItems()) {
                // ВАЖНО: Пропускаем items без productId, так как в БД product_id имеет NOT NULL constraint
                if (itemDTO.getProductId() == null) {
                    logger.warn("Order {} item skipped: productId is null. Item data: priceAtTime={}, quantity={}", 
                            id, itemDTO.getPriceAtTime(), itemDTO.getQuantity());
                    continue; // Пропускаем items без productId
                }
                
                Product product = null;
                try {
                    product = productRepository.findById(itemDTO.getProductId())
                            .orElseThrow(() -> new RuntimeException("Product with ID " + itemDTO.getProductId() + " not found"));
                    
                    // Проверяем, есть ли продукт в каталоге, и если есть - используем актуальную цену
                    boolean productInCatalog = catalogRepository.existsByProductId(itemDTO.getProductId());
                    if (productInCatalog) {
                        // Если продукт в каталоге, используем актуальную цену из product
                        // Обновляем цену продукта, если она изменилась
                        if (product.getPrice() != null && product.getPrice() > 0) {
                            // Используем актуальную цену из каталога
                            logger.debug("Product {} found in catalog, using current price: {}", itemDTO.getProductId(), product.getPrice());
                        }
                    }
                    
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
                } catch (RuntimeException e) {
                    logger.error("Order {} item skipped: Product with ID {} not found. Error: {}", 
                            id, itemDTO.getProductId(), e.getMessage());
                    continue; // Пропускаем items с несуществующим productId
                }
                
                // ВАЖНО: Проверяем, что product не null перед созданием OrderItem
                if (product == null) {
                    logger.warn("Order {} item skipped: product is null after lookup. productId={}", 
                            id, itemDTO.getProductId());
                    continue;
                }

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProduct(product);
                orderItem.setQuantity(itemDTO.getQuantity() != null ? itemDTO.getQuantity() : 1);
                
                // Определяем цену: приоритет - цена из DTO (если админ изменил), затем каталог, затем продукт
                float itemPrice = 0.0f;
                boolean priceFromDTO = false;
                boolean catalogPriceUpdated = false;
                
                if (itemDTO.getPriceAtTime() != null && itemDTO.getPriceAtTime() > 0) {
                    // Используем цену из DTO (админ изменил цену в заказе)
                    itemPrice = itemDTO.getPriceAtTime();
                    priceFromDTO = true;
                    logger.info("Using price from DTO for product {}: {}", product != null ? product.getId() : "null", itemPrice);
                    
                    // Если продукт есть в каталоге, обновляем цену в каталоге
                    if (product != null && catalogRepository.existsByProductId(product.getId())) {
                        float oldCatalogPrice = product.getPrice() != null ? product.getPrice() : 0.0f;
                        if (Math.abs(oldCatalogPrice - itemPrice) > 0.01f) {
                            product.setPrice(itemPrice);
                            productRepository.save(product);
                            catalogPriceUpdated = true;
                            logger.info("Updated catalog price for product {} from {} to {}", product.getId(), oldCatalogPrice, itemPrice);
                        } else {
                            logger.debug("Catalog price for product {} unchanged: {}", product.getId(), itemPrice);
                        }
                    }
                } else if (product != null && catalogRepository.existsByProductId(product.getId())) {
                    // Продукт в каталоге - используем актуальную цену из каталога
                    itemPrice = product.getPrice() != null ? product.getPrice() : 0.0f;
                    logger.debug("Using catalog price for product {}: {}", product.getId(), itemPrice);
                } else if (product != null && product.getPrice() != null) {
                    // Используем цену продукта
                    itemPrice = product.getPrice();
                    logger.debug("Using product price for product {}: {}", product.getId(), itemPrice);
                }
                
                orderItem.setPriceAtTime(itemPrice);
                orderItem.setSupplierPrice(itemDTO.getSupplierPrice() != null ? itemDTO.getSupplierPrice() : 0.0f);
                orderItem.setPurchaseStatus(itemDTO.getPurchaseStatus() != null ? itemDTO.getPurchaseStatus() : "PENDING");
                orderItem.setPurchaseRefusalReason(itemDTO.getPurchaseRefusalReason());
                orderItem.setTrackingNumber(itemDTO.getTrackingNumber());
                orderItem.setChinaDeliveryPrice(itemDTO.getChinaDeliveryPrice() != null ? itemDTO.getChinaDeliveryPrice() : 0.0f);

                // Добавление в каталог только если product не null и заказ проверен
                if (product != null && !catalogRepository.existsByProductId(itemDTO.getProductId())) {
                    Catalog catalog = new Catalog();
                    catalog.setProduct(product);
                    catalogRepository.save(catalog);
                    logger.debug("Product {} added to catalog", product.getId());
                }

                order.getItems().add(orderItem);
                logger.debug("Order {} item added: productId={}, priceAtTime={}, quantity={}", 
                        id, product != null ? product.getId() : "null", itemPrice, orderItem.getQuantity());
            }
            logger.debug("Order {} total items after update: {}", id, order.getItems().size());
        }

        // Пересчёт totalClientPrice ПОСЛЕ обновления items (чтобы использовать актуальные цены из каталога)
        // ВАЖНО: всегда пересчитываем от обновлённых items, чтобы страховка пересчитывалась при изменении цены предмета
        float totalClientPrice = 0.0f;
        float userDiscountAmount = 0.0f;
        float promocodeDiscountAmount = 0.0f;
        float insuranceCost = 0.0f;

        // Вычисляем базовую цену от обновлённых items заказа
        // Приоритет: сначала от обновлённых items в order, затем от DTO
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            // Всегда вычисляем базовую цену от обновлённых items (items уже обновлены выше)
            totalClientPrice = (float) order.getItems().stream()
                    .mapToDouble(item -> (item.getPriceAtTime() != null ? item.getPriceAtTime() : 0.0f) * (item.getQuantity() != null ? item.getQuantity() : 1))
                    .sum();
            logger.debug("Order {} base price calculated from updated items: {}", id, totalClientPrice);
        } else if (orderDetails.getItems() != null && !orderDetails.getItems().isEmpty()) {
            // Если items в DTO есть, но ещё не добавлены в order, вычисляем от DTO
            totalClientPrice = (float) orderDetails.getItems().stream()
                    .mapToDouble(item -> (item.getPriceAtTime() != null ? item.getPriceAtTime() : 0.0f) * (item.getQuantity() != null ? item.getQuantity() : 1))
                    .sum();
            logger.debug("Order {} base price calculated from DTO items: {}", id, totalClientPrice);
        } else {
            // Если items нет или пустые, но totalClientPrice изменён - используем переданную цену как базовую
            float currentFinalPrice = orderDetails.getTotalClientPrice() != null ? orderDetails.getTotalClientPrice() : 
                    (order.getTotalClientPrice() != null ? order.getTotalClientPrice() : 0.0f);
            float currentUserDiscount = order.getUserDiscountApplied() != null ? order.getUserDiscountApplied() : 0.0f;
            float currentPromoDiscount = order.getDiscountApplied() != null ? order.getDiscountApplied() : 0.0f;
            float currentInsurance = order.getInsuranceCost() != null ? order.getInsuranceCost() : 0.0f;
            
            // Восстанавливаем базовую цену: basePrice = finalPrice + discounts - insurance
            totalClientPrice = currentFinalPrice + currentUserDiscount + currentPromoDiscount - currentInsurance;
            
            // Если восстановленная цена некорректна, используем переданную цену как базовую
            if (totalClientPrice <= 0) {
                totalClientPrice = currentFinalPrice > 0 ? currentFinalPrice : 0.0f;
            }
        }

        // Применение скидок пользователя
        User user = order.getUser();
        if (user != null && totalClientPrice > 0) {
            user.verifyDiscount();
            float userDiscountPercent = user.getTotalDiscount();
            if (userDiscountPercent > 0) {
                userDiscountAmount = totalClientPrice * (userDiscountPercent / 100);
                order.setUserDiscountApplied(userDiscountAmount);
            } else {
                order.setUserDiscountApplied(0.0f);
            }
        } else {
            order.setUserDiscountApplied(0.0f);
        }

        // Применение промокода
        Promocode promocode = order.getPromocode();
        if (promocode != null && totalClientPrice > 0) {
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
        } else if (promocode == null) {
            order.setDiscountApplied(0.0f);
        }

        // Применение страховки (5% от базовой цены товаров)
        // ВАЖНО: страховка всегда вычисляется динамически через getInsuranceCost()
        boolean hasInsurance = order.getInsurance() != null && order.getInsurance();
        
        if (hasInsurance && totalClientPrice > 0) {
            insuranceCost = totalClientPrice * 0.05f;
            logger.info("Order {} insurance calculated: basePrice={}, insurance={}", 
                    id, totalClientPrice, insuranceCost);
        } else {
            insuranceCost = 0.0f;
            if (hasInsurance && totalClientPrice <= 0) {
                logger.warn("Order {} has insurance enabled but base price is 0, insurance cost is 0", id);
            } else if (!hasInsurance) {
                logger.debug("Order {} insurance disabled, insurance cost is 0", id);
            }
        }

        // Вычисление финальной цены
        float totalDiscountAmount = userDiscountAmount + promocodeDiscountAmount;
        float finalPrice = totalClientPrice - totalDiscountAmount + insuranceCost;
        if (finalPrice < 0) {
            logger.warn("Validation failed for order {}: final price is negative. Base: {}, Discounts: {}, Insurance: {}", 
                    id, totalClientPrice, totalDiscountAmount, insuranceCost);
            return ResponseEntity.badRequest().body(new ErrorResponse("Скидка превышает стоимость заказа", 400));
        }

        // Устанавливаем пересчитанную финальную цену
        order.setTotalClientPrice(finalPrice);
        
        logger.debug("Order {} price recalculated: base={}, userDiscount={}, promoDiscount={}, insurance={}, final={}", 
                id, totalClientPrice, userDiscountAmount, promocodeDiscountAmount, insuranceCost, finalPrice);

        // Уведомления для невыкупленных товаров
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                if ("NOT_PURCHASED".equals(item.getPurchaseStatus()) && item.getPurchaseRefusalReason() != null) {
                    try {
                        notificationService.sendOrderItemStatusChangeNotification(
                                order.getUser(),
                                order.getId(),
                                item.getProduct() != null ? item.getProduct().getName() : "Unknown Product",
                                item.getPurchaseRefusalReason()
                        );
                    } catch (Exception e) {
                        logger.error("Failed to send item notification for order {}: {}", id, e.getMessage(), e);
                    }
                }
            }
        }

        // Уведомления о статусе заказа
        if (order.getStatus().equals("REFUSED")) {
            try {
                notificationService.sendOrderStatusChangeNotification(order.getUser(), order.getId(), "REFUSED");
            } catch (Exception e) {
                logger.error("Failed to send notification for order {}: {}", id, e.getMessage(), e);
            }
        } else if (order.getStatus().equals("RECEIVED")) {
            try {
                notificationService.sendOrderStatusChangeNotification(order.getUser(), order.getId(), "RECEIVED");
            } catch (Exception e) {
                logger.error("Failed to send notification for order {}: {}", id, e.getMessage(), e);
            }
        }

        orderRepository.save(order);

        if (order.getStatus().equals("VERIFIED")) {
            if (user != null) {
                // Отправка уведомления на сайте (всегда)
                try {
                    notificationService.sendOrderStatusChangeNotification(user, order.getId(), "VERIFIED");
                } catch (Exception e) {
                    logger.error("Failed to send notification for order {}: {}", id, e.getMessage(), e);
                }

                // Отправка email-уведомления (если email верифицирован и флаг уведомлений включен)
                if (user.getEmailVerified() != null && user.getEmailVerified() &&
                    user.getNotificationsEnabled() != null && user.getNotificationsEnabled()) {
                    try {
                        gmailSenderService.sendOrderApprovalNotification(
                            user.getEmail(),
                            order.getId(),
                            order.getOrderNumber(),
                            order.getTotalClientPrice(),
                            order.getShippingRateFixed()
                        );
                    } catch (Exception e) {
                        logger.error("Failed to send email notification for order {}: {}", id, e.getMessage(), e);
                    }
                }
            }
        }

        OrderDTO responseDTO = mapToOrderDTO(order);
        logger.debug("Order {} verified successfully", id);
        return ResponseEntity.ok(responseDTO);
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
        orderDTO.setChinaTrackingNumber(order.getChinaTrackingNumber());
        orderDTO.setInternationalTrackingNumber(order.getInternationalTrackingNumber());
        orderDTO.setLocalTrackingNumber(order.getLocalTrackingNumber());
        orderDTO.setWeight(order.getWeight());
        orderDTO.setCustomsStatus(order.getCustomsStatus());
        orderDTO.setReasonRefusal(order.getReasonRefusal());
        orderDTO.setInsurance(order.getInsurance());
        orderDTO.setDiscountType(order.getDiscountType());
        orderDTO.setDiscountValue(order.getDiscountValue());
        orderDTO.setPromocode(order.getPromocode() != null ? order.getPromocode().getCode() : null);
        orderDTO.setInsuranceCost(order.getInsuranceCost()); // Вычисляется динамически через getInsuranceCost()
        orderDTO.setUserDiscountApplied(order.getUserDiscountApplied());
        orderDTO.setDiscountApplied(order.getDiscountApplied());
        orderDTO.setPaymentMethod(order.getPaymentMethod());
        orderDTO.setPhone(order.getPhone());
        orderDTO.setLastName(order.getLastName());
        orderDTO.setFirstName(order.getFirstName());
        orderDTO.setMiddleName(order.getMiddleName());

        orderDTO.setItems(order.getItems().stream()
                .map(item -> {
                    OrderItemDTO itemDTO = new OrderItemDTO();
                    itemDTO.setId(item.getId());
                    // Обработка удаленного или отсутствующего продукта
                    // Hibernate proxy может не быть null, но продукт может быть удален
                    try {
                        Product product = item.getProduct();
                        if (product != null) {
                            // Попытка доступа к полям продукта может вызвать EntityNotFoundException
                            // если продукт был удален из базы данных
                            itemDTO.setProductId(product.getId());
                            itemDTO.setProductName(product.getName());
                            itemDTO.setUrl(product.getUrl());
                            itemDTO.setImageUrl(product.getImageUrl() != null ? product.getImageUrl() : "https://placehold.co/128x128?text=No+Image");
                            itemDTO.setDescription(product.getDescription());
                        } else {
                            // Product is null
                            itemDTO.setProductId(null);
                            itemDTO.setProductName("Unknown Product");
                            itemDTO.setUrl(null);
                            itemDTO.setImageUrl("https://placehold.co/128x128?text=No+Image");
                            itemDTO.setDescription(null);
                        }
                    } catch (EntityNotFoundException e) {
                        // Product was deleted from database
                        logger.warn("Product not found for order item {}: {}", item.getId(), e.getMessage());
                        itemDTO.setProductId(null);
                        itemDTO.setProductName("Deleted Product");
                        itemDTO.setUrl(null);
                        itemDTO.setImageUrl("https://placehold.co/128x128?text=Deleted+Product");
                        itemDTO.setDescription("This product has been removed from the catalog");
                    } catch (Exception e) {
                        // Any other exception when accessing product
                        logger.error("Error accessing product for order item {}: {}", item.getId(), e.getMessage());
                        itemDTO.setProductId(null);
                        itemDTO.setProductName("Unknown Product");
                        itemDTO.setUrl(null);
                        itemDTO.setImageUrl("https://placehold.co/128x128?text=No+Image");
                        itemDTO.setDescription(null);
                    }
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setPriceAtTime(item.getPriceAtTime());
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
            logger.debug("Current user: {}, Authorities: {}", email, 
                    SecurityContextHolder.getContext().getAuthentication().getAuthorities());
            return email;
        } catch (Exception e) {
            logger.warn("Error getting user email: {}", e.getMessage());
            return null;
        }
    }

    @Data
    static class CreateOrderRequest {
        private List<CartItemDTO> cartItems;
        private String deliveryAddress;
        private String phone;
        private String promocode;
        private Boolean insurance;
        private String discountType;
        private Float discountValue;
    }

    @Data
    static class SelfPickupOrderRequest {
        private List<String> trackingNumbers;
        private String deliveryAddress;
        private String warehouseIdFinish;
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
        private String chinaTrackingNumber;
        private String internationalTrackingNumber;
        private String localTrackingNumber;
        private Float weight;
        private String customsStatus;
        private List<OrderItemDTO> items;
        private String userEmail;
        private String reasonRefusal;
        private Boolean insurance;
        private String discountType;
        private Float discountValue;
        private String promocode;
        private Float insuranceCost;
        private Float userDiscountApplied;
        private Float discountApplied;
        private String paymentMethod; // NO_BALANCE (обычная оплата)
        private String phone; // Телефон клиента
        private String lastName; // Фамилия клиента
        private String firstName; // Имя клиента
        private String middleName; // Отчество клиента
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

    @Data
    static class PagedResponse<T> {
        private List<T> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean last;

        public PagedResponse(List<T> content, int page, int size, long totalElements, int totalPages, boolean last) {
            this.content = content;
            this.page = page;
            this.size = size;
            this.totalElements = totalElements;
            this.totalPages = totalPages;
            this.last = last;
        }
    }
}