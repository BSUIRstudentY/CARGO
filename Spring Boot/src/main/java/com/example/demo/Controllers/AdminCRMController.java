package com.example.demo.Controllers;

import com.example.demo.Entities.*;
import com.example.demo.Repositories.*;
import com.example.demo.Services.NewsService;
import com.example.demo.Services.QuestService;
import com.example.demo.Services.TicketService;
import com.example.demo.Services.NotificationService;
import com.example.demo.Services.GmailSenderService;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Полнофункциональная CRM-система для администратора
 * Предоставляет полный доступ ко всем функциям управления сайтом
 */
@RestController
@RequestMapping("/api/admin/crm")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCRMController {
    private static final Logger log = LoggerFactory.getLogger(AdminCRMController.class);

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private QuestRepository questRepository;
    
    @Autowired
    private QuestProgressRepository questProgressRepository;
    
    @Autowired
    private PromocodeRepository promocodeRepository;
    
    @Autowired
    private NewsService newsService;
    
    @Autowired
    private NewsRepository newsRepository;
    
    @Autowired
    private TicketService ticketService;
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private BatchCargoRepository batchCargoRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private ProductReviewRepository productReviewRepository;
    
    @Autowired
    private CatalogRepository catalogRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private QuestService questService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private GmailSenderService gmailSenderService;

    // ==================== СТАТИСТИКА И АНАЛИТИКА ====================
    
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        DashboardStats stats = new DashboardStats();
        
        // Пользователи
        stats.setTotalUsers(userRepository.count());
        stats.setActiveUsers(userRepository.count()); // Можно добавить логику активных пользователей
        Timestamp yesterday = new Timestamp(System.currentTimeMillis() - 86400000);
        stats.setNewUsersToday(userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && 
                        u.getCreatedAt().toLocalDate().isAfter(yesterday.toLocalDateTime().toLocalDate()))
                .count());
        
        // Заказы
        stats.setTotalOrders(orderRepository.count());
        stats.setPendingOrders(orderRepository.findByStatus("PENDING").size());
        stats.setPaidOrders(orderRepository.findByStatus("PAID").size());
        stats.setCompletedOrders(orderRepository.findByStatus("COMPLETED").size());
        stats.setCancelledOrders(orderRepository.findByStatus("CANCELLED").size());
        
        // Товары
        stats.setTotalProducts(productRepository.count());
        stats.setActiveProducts(productRepository.findAll().stream()
                .filter(p -> "ACTIVE".equals(p.getStatus()))
                .count());
        stats.setPendingProducts(productRepository.findAll().stream()
                .filter(p -> "PENDING".equals(p.getStatus()))
                .count());
        
        // Финансы
        List<Order> paidOrders = orderRepository.findByStatus("PAID");
        double totalRevenue = paidOrders.stream()
                .mapToDouble(o -> o.getTotalClientPrice() != null ? o.getTotalClientPrice() : 0.0)
                .sum();
        stats.setTotalRevenue(totalRevenue);
        
        // Тикеты
        stats.setTotalTickets(ticketRepository.count());
        stats.setOpenTickets(ticketRepository.findAll().stream()
                .filter(t -> t.getStatus() == TicketStatus.OPEN)
                .count());
        
        // Батч-карго
        stats.setTotalBatchCargos(batchCargoRepository.count());
        stats.setUnfinishedBatches(batchCargoRepository.findUnfinishedBatches().size());
        
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/dashboard/revenue")
    public ResponseEntity<RevenueStats> getRevenueStats(
            @RequestParam(required = false) Integer days) {
        int daysBack = days != null ? days : 30;
        Timestamp startDate = new Timestamp(System.currentTimeMillis() - (daysBack * 86400000L));
        
        RevenueStats stats = new RevenueStats();
        List<Order> recentOrders = orderRepository.findAll().stream()
                .filter(o -> o.getDateCreated() != null && o.getDateCreated().after(startDate))
                .filter(o -> "PAID".equals(o.getStatus()))
                .collect(Collectors.toList());
        
        stats.setTotalRevenue(recentOrders.stream()
                .mapToDouble(o -> o.getTotalClientPrice() != null ? o.getTotalClientPrice() : 0.0)
                .sum());
        stats.setOrderCount(recentOrders.size());
        stats.setAverageOrderValue(stats.getOrderCount() > 0 ? 
                stats.getTotalRevenue() / stats.getOrderCount() : 0.0);
        
        return ResponseEntity.ok(stats);
    }

    // ==================== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ====================
    
    @GetMapping("/users")
    public ResponseEntity<Page<User>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        // Простая реализация - можно улучшить через Specification
        List<User> allUsers = userRepository.findAll();
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase().trim();
            allUsers = allUsers.stream()
                    .filter(u -> (u.getEmail() != null && u.getEmail().toLowerCase().contains(searchLower)) ||
                            (u.getDisplayUsername() != null && u.getDisplayUsername().toLowerCase().contains(searchLower)) ||
                            (u.getCompany() != null && u.getCompany().toLowerCase().contains(searchLower)) ||
                            (u.getRole() != null && u.getRole().toLowerCase().contains(searchLower)) ||
                            (u.getTelegramUserId() != null && u.getTelegramUserId().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }
        if (role != null && !role.isEmpty()) {
            allUsers = allUsers.stream()
                    .filter(u -> role.equals(u.getRole()))
                    .collect(Collectors.toList());
        }
        
        // Простая пагинация вручную
        int start = page * size;
        int end = Math.min(start + size, allUsers.size());
        List<User> pageContent = start < allUsers.size() ? 
                allUsers.subList(start, end) : Collections.emptyList();
        
        return ResponseEntity.ok(new org.springframework.data.domain.PageImpl<>(
                pageContent, pageable, allUsers.size()));
    }
    
    @GetMapping("/users/{email}")
    public ResponseEntity<User> getUser(@PathVariable String email) {
        return userRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/users/{email}/orders")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable String email) {
        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(orderRepository.findByUserEmail(email)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/users/{email}/tickets")
    public ResponseEntity<List<Ticket>> getUserTickets(@PathVariable String email) {
        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(ticketRepository.findByUserEmail(email)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/users/{email}/quest-progress")
    public ResponseEntity<List<QuestProgress>> getUserQuestProgress(@PathVariable String email) {
        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(questProgressRepository.findByUser(user)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/users/{email}/transactions")
    public ResponseEntity<List<Transaction>> getUserTransactions(@PathVariable String email) {
        List<Order> userOrders = orderRepository.findByUserEmail(email);
        List<Transaction> transactions = new ArrayList<>();
        for (Order order : userOrders) {
            transactions.addAll(transactionRepository.findAllByOrderId(order.getId()));
        }
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/users/{email}/notifications")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable String email) {
        return ResponseEntity.ok(notificationRepository.findByUserEmail(email));
    }
    
    @GetMapping("/users/{email}/reviews")
    public ResponseEntity<List<Review>> getUserReviews(@PathVariable String email) {
        // Review не имеет прямой связи с User, возвращаем все отзывы
        // Можно добавить фильтрацию по имени, если оно совпадает с username пользователя
        List<Review> allReviews = reviewRepository.findAll();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            List<Review> userReviews = allReviews.stream()
                    .filter(r -> r.getName() != null && r.getName().equals(user.getUsername()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(userReviews);
        }
        return ResponseEntity.ok(Collections.emptyList());
    }
    
    @GetMapping("/users/{email}/product-reviews")
    public ResponseEntity<List<ProductReview>> getUserProductReviews(@PathVariable String email) {
        List<ProductReview> allProductReviews = productReviewRepository.findAll();
        List<ProductReview> userProductReviews = allProductReviews.stream()
                .filter(pr -> pr.getUser() != null && email.equals(pr.getUser().getEmail()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(userProductReviews);
    }
    
    
    @GetMapping("/users/{email}/referrals")
    public ResponseEntity<List<User>> getUserReferrals(@PathVariable String email) {
        return userRepository.findByEmail(email)
                .map(user -> {
                    // Находим всех пользователей, которые были приглашены этим пользователем
                    List<User> allUsers = userRepository.findAll();
                    List<User> referrals = allUsers.stream()
                            .filter(u -> u.getReferredBy() != null && 
                                    email.equals(u.getReferredBy().getEmail()))
                            .collect(Collectors.toList());
                    return ResponseEntity.ok(referrals);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/users/{email}/full")
    public ResponseEntity<Map<String, Object>> getUserFullData(@PathVariable String email) {
        return userRepository.findByEmail(email)
                .map(user -> {
                    Map<String, Object> fullData = new HashMap<>();
                    fullData.put("user", user);
                    fullData.put("orders", orderRepository.findByUserEmail(email));
                    fullData.put("tickets", ticketRepository.findByUserEmail(email));
                    fullData.put("questProgress", questProgressRepository.findByUser(user));
                    fullData.put("notifications", notificationRepository.findByUserEmail(email));
                    
                    // Транзакции
                    List<Order> userOrders = orderRepository.findByUserEmail(email);
                    List<Transaction> transactions = new ArrayList<>();
                    for (Order order : userOrders) {
                        transactions.addAll(transactionRepository.findAllByOrderId(order.getId()));
                    }
                    fullData.put("transactions", transactions);
                    
                    // Рефералы
                    List<User> allUsers = userRepository.findAll();
                    List<User> referrals = allUsers.stream()
                            .filter(u -> u.getReferredBy() != null && 
                                    email.equals(u.getReferredBy().getEmail()))
                            .collect(Collectors.toList());
                    fullData.put("referrals", referrals);
                    
                    // Отзывы (Review не имеет прямой связи с User, фильтруем по имени)
                    List<Review> allReviews = reviewRepository.findAll();
                    List<Review> userReviews = allReviews.stream()
                            .filter(r -> r.getName() != null && r.getName().equals(user.getUsername()))
                            .collect(Collectors.toList());
                    fullData.put("reviews", userReviews);
                    
                    // Отзывы на товары
                    List<ProductReview> allProductReviews = productReviewRepository.findAll();
                    List<ProductReview> userProductReviews = allProductReviews.stream()
                            .filter(pr -> pr.getUser() != null && email.equals(pr.getUser().getEmail()))
                            .collect(Collectors.toList());
                    fullData.put("productReviews", userProductReviews);
                    
                    return ResponseEntity.ok(fullData);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/users/{email}")
    @Transactional
    public ResponseEntity<User> updateUser(@PathVariable String email, @RequestBody UserUpdateRequest request) {
        return userRepository.findByEmail(email)
                .map(user -> {
                    if (request.getUsername() != null) user.setUsername(request.getUsername());
                    if (request.getCompany() != null) user.setCompany(request.getCompany());
                    if (request.getRole() != null) user.setRole(request.getRole());
                    if (request.getDiscountPercent() != null) user.setDiscountPercent(request.getDiscountPercent());
                    if (request.getTemporaryDiscountPercent() != null) {
                        user.setTemporaryDiscountPercent(request.getTemporaryDiscountPercent());
                    }
                    if (request.getNotificationsEnabled() != null) {
                        user.setNotificationsEnabled(request.getNotificationsEnabled());
                    }
                    if (request.getTwoFactorEnabled() != null) {
                        user.setTwoFactorEnabled(request.getTwoFactorEnabled());
                    }
                    if (request.getEmailVerified() != null) {
                        user.setEmailVerified(request.getEmailVerified());
                    }
                    if (request.getTelegramUserId() != null) {
                        user.setTelegramUserId(request.getTelegramUserId());
                    }
                    if (request.getTelegramVerified() != null) {
                        user.setTelegramVerified(request.getTelegramVerified());
                    }
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    
    @PutMapping("/users/{email}/password")
    @Transactional
    public ResponseEntity<String> resetUserPassword(
            @PathVariable String email,
            @RequestBody PasswordResetRequest request) {
        return userRepository.findByEmail(email)
                .map(user -> {
                    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                    userRepository.save(user);
                    return ResponseEntity.ok("Пароль успешно изменен");
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/users/{email}")
    @Transactional
    public ResponseEntity<String> deleteUser(@PathVariable String email) {
        return userRepository.findByEmail(email)
                .map(user -> {
                    userRepository.delete(user);
                    return ResponseEntity.ok("Пользователь удален");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ==================== УПРАВЛЕНИЕ ЗАКАЗАМИ ====================
    
    @GetMapping("/orders")
    public ResponseEntity<Page<Order>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateCreated").descending());
        
        List<Order> orders = status != null && !status.isEmpty() ?
                orderRepository.findByStatus(status) : orderRepository.findAll();
        
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase().trim();
            final String searchStr = search.trim();
            orders = orders.stream()
                    .filter(o -> (o.getOrderNumber() != null && o.getOrderNumber().toLowerCase().contains(searchLower)) ||
                            (o.getTrackingNumber() != null && o.getTrackingNumber().toLowerCase().contains(searchLower)) ||
                            (o.getId() != null && searchStr.equals(String.valueOf(o.getId()))) ||
                            (o.getUser() != null && o.getUser().getEmail() != null && o.getUser().getEmail().toLowerCase().contains(searchLower)) ||
                            (o.getDeliveryAddress() != null && o.getDeliveryAddress().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }
        
        int start = page * size;
        int end = Math.min(start + size, orders.size());
        List<Order> pageContent = start < orders.size() ? 
                orders.subList(start, end) : Collections.emptyList();
        
        return ResponseEntity.ok(new org.springframework.data.domain.PageImpl<>(
                pageContent, pageable, orders.size()));
    }
    
    @GetMapping("/orders/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/orders/{id}/full")
    public ResponseEntity<Map<String, Object>> getOrderFullData(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(order -> {
                    Map<String, Object> fullData = new HashMap<>();
                    fullData.put("order", order);
                    fullData.put("transactions", transactionRepository.findAllByOrderId(id));
                    fullData.put("items", order.getItems() != null ? order.getItems() : new ArrayList<>());
                    if (order.getUser() != null) {
                        fullData.put("user", order.getUser());
                    }
                    BatchCargo batchCargo = order.getBatchCargo();
                    if (batchCargo != null) {
                        fullData.put("batchCargo", batchCargo);
                    }
                    Promocode promocode = order.getPromocode();
                    if (promocode != null) {
                        fullData.put("promocode", promocode);
                    }
                    return ResponseEntity.ok(fullData);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/orders/{id}/transactions")
    public ResponseEntity<List<Transaction>> getOrderTransactions(@PathVariable Long id) {
        return ResponseEntity.ok(transactionRepository.findAllByOrderId(id));
    }
    
    @PutMapping("/orders/{id}/status")
    @Transactional
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        return orderRepository.findById(id)
                .map(order -> {
                    String oldStatus = order.getStatus();
                    order.setStatus(request.getStatus());
                    if (request.getReasonRefusal() != null) {
                        order.setReasonRefusal(request.getReasonRefusal());
                    }
                    Order savedOrder = orderRepository.save(order);

                    // Отправка уведомлений при одобрении заказа
                    if ("VERIFIED".equals(request.getStatus()) && !"VERIFIED".equals(oldStatus)) {
                        User user = savedOrder.getUser();
                        if (user != null) {
                            // Отправка уведомления на сайте (всегда)
                            try {
                                notificationService.sendOrderStatusChangeNotification(user, savedOrder.getId(), "VERIFIED");
                            } catch (Exception e) {
                                log.error("Failed to send notification for order {}: {}", id, e.getMessage(), e);
                            }

                            // Отправка email-уведомления (если email верифицирован и флаг уведомлений включен)
                            if (user.getEmailVerified() != null && user.getEmailVerified() &&
                                user.getNotificationsEnabled() != null && user.getNotificationsEnabled()) {
                                try {
                                    gmailSenderService.sendOrderApprovalNotification(
                                        user.getEmail(),
                                        savedOrder.getId(),
                                        savedOrder.getOrderNumber(),
                                        savedOrder.getTotalClientPrice(),
                                        savedOrder.getShippingRateFixed()
                                    );
                                } catch (Exception e) {
                                    log.error("Failed to send email notification for order {}: {}", id, e.getMessage(), e);
                                }
                            }
                        }
                    }

                    return ResponseEntity.ok(savedOrder);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/orders/{id}")
    @Transactional
    public ResponseEntity<Order> updateOrder(
            @PathVariable Long id,
            @RequestBody OrderUpdateRequest request) {
        return orderRepository.findById(id)
                .map(order -> {
                    String oldStatus = order.getStatus();
                    if (request.getStatus() != null) order.setStatus(request.getStatus());
                    
                    // ВАЖНО: Сохраняем текущее значение страховки, если оно не передано явно
                    // Страховка должна сохраняться при любых обновлениях заказа
                    boolean currentInsurance = order.getInsurance() != null && order.getInsurance();
                    
                    // Пересчёт всех связанных с ценой полей при изменении totalClientPrice
                    if (request.getTotalClientPrice() != null) {
                        // Вычисляем базовую цену товаров из items
                        float basePrice = 0.0f;
                        if (order.getItems() != null && !order.getItems().isEmpty()) {
                            // Если items есть, вычисляем базовую цену от суммы items
                            basePrice = (float) order.getItems().stream()
                                    .mapToDouble(item -> (item.getPriceAtTime() != null ? item.getPriceAtTime() : 0.0f) 
                                            * (item.getQuantity() != null ? item.getQuantity() : 1))
                                    .sum();
                        } else {
                            // Если items нет, используем переданную цену как базовую для пересчёта
                            // Восстанавливаем базовую цену из текущей финальной: finalPrice = basePrice - discounts + insurance
                            float currentFinalPrice = order.getTotalClientPrice() != null ? order.getTotalClientPrice() : 0.0f;
                            float currentInsuranceCost = order.getInsuranceCost(); // Вычисляется динамически
                            float currentUserDiscount = order.getUserDiscountApplied() != null ? order.getUserDiscountApplied() : 0.0f;
                            float currentPromoDiscount = order.getDiscountApplied() != null ? order.getDiscountApplied() : 0.0f;
                            // Восстанавливаем базовую цену: basePrice = finalPrice + discounts - insurance
                            basePrice = currentFinalPrice + currentUserDiscount + currentPromoDiscount - currentInsuranceCost;
                            // Если восстановленная базовая цена некорректна, используем переданную цену как базовую
                            if (basePrice <= 0) {
                                basePrice = request.getTotalClientPrice();
                            }
                        }
                        
                        // Пересчёт страховки (5% от базовой цены, если страховка включена)
                        // ВАЖНО: Страховка вычисляется динамически через getInsuranceCost(), не сохраняется в БД
                        boolean hasInsurance = currentInsurance;
                        float insuranceCost = 0.0f;
                        if (hasInsurance && basePrice > 0) {
                            insuranceCost = basePrice * 0.05f;
                            log.info("Order {} insurance calculated: basePrice={}, insurance={}", id, basePrice, insuranceCost);
                        } else {
                            insuranceCost = 0.0f;
                            if (!hasInsurance) {
                                log.debug("Order {} insurance disabled, insurance cost is 0", id);
                            } else {
                                log.warn("Order {} has insurance enabled but base price is 0, insurance cost is 0", id);
                            }
                        }
                        
                        // Пересчёт скидки пользователя (процент от базовой цены)
                        User user = order.getUser();
                        float userDiscountAmount = 0.0f;
                        if (user != null && basePrice > 0) {
                            user.verifyDiscount();
                            float userDiscountPercent = user.getTotalDiscount();
                            if (userDiscountPercent > 0) {
                                userDiscountAmount = basePrice * (userDiscountPercent / 100);
                                order.setUserDiscountApplied(userDiscountAmount);
                            } else {
                                order.setUserDiscountApplied(0.0f);
                            }
                        }
                        
                        // Пересчёт скидки промокода
                        Promocode promocode = order.getPromocode();
                        float promocodeDiscountAmount = 0.0f;
                        if (promocode != null && basePrice > 0) {
                            if (!promocode.getIsActive() ||
                                    LocalDateTime.now().isBefore(promocode.getValidFrom()) ||
                                    LocalDateTime.now().isAfter(promocode.getValidUntil()) ||
                                    (promocode.getUsageLimit() != null && promocode.getUsedCount() >= promocode.getUsageLimit())) {
                                order.setPromocode(null);
                                order.setDiscountApplied(0.0f);
                                promocodeDiscountAmount = 0.0f;
                            } else {
                                if (promocode.getDiscountType() == DiscountType.PERCENTAGE) {
                                    promocodeDiscountAmount = basePrice * (promocode.getDiscountValue() / 100);
                                } else {
                                    promocodeDiscountAmount = promocode.getDiscountValue();
                                }
                                order.setDiscountApplied(promocodeDiscountAmount);
                            }
                        } else if (promocode == null) {
                            order.setDiscountApplied(0.0f);
                        }
                        
                        // Вычисление финальной цены
                        float totalDiscountAmount = userDiscountAmount + promocodeDiscountAmount;
                        float finalPrice = basePrice - totalDiscountAmount + insuranceCost;
                        
                        // Если финальная цена отрицательная, устанавливаем базовую цену
                        if (finalPrice < 0) {
                            log.warn("Calculated final price is negative for order {}, using base price", id);
                            finalPrice = basePrice;
                        }
                        
                        // Устанавливаем пересчитанную финальную цену
                        order.setTotalClientPrice(finalPrice);
                    } else {
                        // Если totalClientPrice не изменяется, страховка всё равно вычисляется динамически
                        // через getInsuranceCost() на основе текущих items
                        log.debug("Order {} totalClientPrice not changed, insurance will be calculated dynamically", id);
                    }
                    
                    // ВАЖНО: Убеждаемся, что страховка сохранена (не перезаписываем, если не передана явно)
                    // order.setInsurance() не вызывается, так как в OrderUpdateRequest нет поля insurance
                    // Это правильно - страховка сохраняется из текущего значения заказа
                    
                    if (request.getTrackingNumber() != null) {
                        order.setTrackingNumber(request.getTrackingNumber());
                    }
                    if (request.getDeliveryAddress() != null) {
                        order.setDeliveryAddress(request.getDeliveryAddress());
                    }
                    if (request.getReasonRefusal() != null) {
                        order.setReasonRefusal(request.getReasonRefusal());
                    }
                    Order savedOrder = orderRepository.save(order);

                    // Отправка уведомлений при одобрении заказа
                    if (request.getStatus() != null && "VERIFIED".equals(request.getStatus()) && !"VERIFIED".equals(oldStatus)) {
                        User user = savedOrder.getUser();
                        if (user != null) {
                            // Отправка уведомления на сайте (всегда)
                            try {
                                notificationService.sendOrderStatusChangeNotification(user, savedOrder.getId(), "VERIFIED");
                            } catch (Exception e) {
                                log.error("Failed to send notification for order {}: {}", id, e.getMessage(), e);
                            }

                            // Отправка email-уведомления (если email верифицирован и флаг уведомлений включен)
                            if (user.getEmailVerified() != null && user.getEmailVerified() &&
                                user.getNotificationsEnabled() != null && user.getNotificationsEnabled()) {
                                try {
                                    gmailSenderService.sendOrderApprovalNotification(
                                        user.getEmail(),
                                        savedOrder.getId(),
                                        savedOrder.getOrderNumber(),
                                        savedOrder.getTotalClientPrice(),
                                        savedOrder.getShippingRateFixed()
                                    );
                                } catch (Exception e) {
                                    log.error("Failed to send email notification for order {}: {}", id, e.getMessage(), e);
                                }
                            }
                        }
                    }

                    return ResponseEntity.ok(savedOrder);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/orders/{id}")
    @Transactional
    public ResponseEntity<String> deleteOrder(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(order -> {
                    orderRepository.delete(order);
                    return ResponseEntity.ok("Заказ удален");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ==================== УПРАВЛЕНИЕ ТОВАРАМИ ====================
    
    @GetMapping("/products")
    public ResponseEntity<Page<Product>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("lastUpdated").descending());
        
        List<Product> products = productRepository.findAll();
        if (status != null && !status.isEmpty()) {
            products = products.stream()
                    .filter(p -> status.equals(p.getStatus()))
                    .collect(Collectors.toList());
        }
        if (search != null && !search.isEmpty()) {
            products = products.stream()
                    .filter(p -> p.getName().toLowerCase().contains(search.toLowerCase()) ||
                            (p.getId() != null && p.getId().contains(search)))
                    .collect(Collectors.toList());
        }
        
        int start = page * size;
        int end = Math.min(start + size, products.size());
        List<Product> pageContent = start < products.size() ? 
                products.subList(start, end) : Collections.emptyList();
        
        return ResponseEntity.ok(new org.springframework.data.domain.PageImpl<>(
                pageContent, pageable, products.size()));
    }
    
    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable String id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/products/{id}/full")
    public ResponseEntity<Map<String, Object>> getProductFullData(@PathVariable String id) {
        return productRepository.findById(id)
                .map(product -> {
                    Map<String, Object> fullData = new HashMap<>();
                    fullData.put("product", product);
                    
                    // Отзывы на товар
                    List<ProductReview> productReviews = productReviewRepository.findByProductId(id, Pageable.unpaged()).getContent();
                    fullData.put("reviews", productReviews);
                    
                    // Заказы с этим товаром (через OrderItem)
                    List<OrderItem> orderItems = orderItemRepository.findAll().stream()
                            .filter(oi -> oi.getProduct() != null && id.equals(oi.getProduct().getId()))
                            .collect(Collectors.toList());
                    List<Order> orders = orderItems.stream()
                            .map(OrderItem::getOrder)
                            .distinct()
                            .collect(Collectors.toList());
                    fullData.put("orders", orders);
                    fullData.put("orderItems", orderItems);
                    
                    // Статистика
                    Map<String, Object> stats = new HashMap<>();
                    stats.put("totalOrders", orders.size());
                    stats.put("totalQuantity", orderItems.stream()
                            .mapToInt(oi -> oi.getQuantity() != null ? oi.getQuantity() : 0)
                            .sum());
                    stats.put("totalReviews", productReviews.size());
                    double avgRating = productReviews.stream()
                            .filter(pr -> pr.getRating() != null)
                            .mapToDouble(pr -> pr.getRating().doubleValue())
                            .average()
                            .orElse(0.0);
                    stats.put("averageRating", avgRating);
                    fullData.put("stats", stats);
                    
                    return ResponseEntity.ok(fullData);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/products/{id}/reviews")
    public ResponseEntity<Page<ProductReview>> getProductReviews(
            @PathVariable String id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(productReviewRepository.findByProductId(id, pageable));
    }
    
    @GetMapping("/products/{id}/orders")
    public ResponseEntity<List<Order>> getProductOrders(@PathVariable String id) {
        List<OrderItem> orderItems = orderItemRepository.findAll().stream()
                .filter(oi -> oi.getProduct() != null && id.equals(oi.getProduct().getId()))
                .collect(Collectors.toList());
        List<Order> orders = orderItems.stream()
                .map(OrderItem::getOrder)
                .distinct()
                .collect(Collectors.toList());
        return ResponseEntity.ok(orders);
    }
    
    @PostMapping("/products")
    @Transactional
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        product.setStatus(product.getStatus() != null ? product.getStatus() : "PENDING");
        product.setLastUpdated(new Timestamp(System.currentTimeMillis()));
        if (product.getSalesCount() == null) product.setSalesCount(0);
        if (product.getTotalReviewSumm() == null) product.setTotalReviewSumm(0);
        if (product.getReviewQuantity() == null) product.setReviewQuantity(0);
        return ResponseEntity.ok(productRepository.save(product));
    }
    
    @PutMapping("/products/{id}")
    @Transactional
    public ResponseEntity<Product> updateProduct(
            @PathVariable String id,
            @RequestBody Product product) {
        return productRepository.findById(id)
                .map(existing -> {
                    if (product.getName() != null) existing.setName(product.getName());
                    if (product.getPrice() != null) existing.setPrice(product.getPrice());
                    if (product.getDescription() != null) existing.setDescription(product.getDescription());
                    if (product.getImageUrl() != null) existing.setImageUrl(product.getImageUrl());
                    if (product.getStatus() != null) existing.setStatus(product.getStatus());
                    if (product.getOriginCountry() != null) existing.setOriginCountry(product.getOriginCountry());
                    if (product.getWeightKg() != null) existing.setWeightKg(product.getWeightKg());
                    if (product.getLengthCm() != null) existing.setLengthCm(product.getLengthCm());
                    if (product.getWidthCm() != null) existing.setWidthCm(product.getWidthCm());
                    if (product.getHeightCm() != null) existing.setHeightCm(product.getHeightCm());
                    existing.setLastUpdated(new Timestamp(System.currentTimeMillis()));
                    return ResponseEntity.ok(productRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/products/{id}/status")
    @Transactional
    public ResponseEntity<Product> updateProductStatus(
            @PathVariable String id,
            @RequestBody StatusUpdateRequest request) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setStatus(request.getStatus());
                    product.setLastUpdated(new Timestamp(System.currentTimeMillis()));
                    return ResponseEntity.ok(productRepository.save(product));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/products/{id}")
    @Transactional
    public ResponseEntity<String> deleteProduct(@PathVariable String id) {
        return productRepository.findById(id)
                .map(product -> {
                    productRepository.delete(product);
                    return ResponseEntity.ok("Товар удален");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ==================== УПРАВЛЕНИЕ КВЕСТАМИ ====================
    
    @GetMapping("/quests")
    public ResponseEntity<List<Quest>> getAllQuests() {
        return ResponseEntity.ok(questService.getAllQuests());
    }
    
    @GetMapping("/quests/{id}")
    public ResponseEntity<Quest> getQuest(@PathVariable Long id) {
        return questRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/quests")
    @Transactional
    public ResponseEntity<Quest> createQuest(@RequestBody Quest quest) {
        return ResponseEntity.ok(questService.createQuest(quest));
    }
    
    @PutMapping("/quests/{id}")
    @Transactional
    public ResponseEntity<Quest> updateQuest(
            @PathVariable Long id,
            @RequestBody Quest quest) {
        return questRepository.findById(id)
                .map(existing -> {
                    if (quest.getName() != null) existing.setName(quest.getName());
                    if (quest.getDescription() != null) existing.setDescription(quest.getDescription());
                    if (quest.getQuestConditionType() != null) {
                        existing.setQuestConditionType(quest.getQuestConditionType());
                    }
                    existing.setTargetValue(quest.getTargetValue());
                    existing.setReward(quest.getReward());
                    if (quest.getRewardType() != null) existing.setRewardType(quest.getRewardType());
                    return ResponseEntity.ok(questRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/quests/{id}")
    @Transactional
    public ResponseEntity<String> deleteQuest(@PathVariable Long id) {
        return questRepository.findById(id)
                .map(quest -> {
                    questRepository.delete(quest);
                    return ResponseEntity.ok("Квест удален");
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/quests/progress")
    public ResponseEntity<List<QuestProgress>> getAllQuestProgress() {
        return ResponseEntity.ok(questProgressRepository.findAll());
    }
    
    // ==================== УПРАВЛЕНИЕ ПРОМОКОДАМИ ====================
    
    @GetMapping("/promocodes")
    public ResponseEntity<List<Promocode>> getAllPromocodes() {
        return ResponseEntity.ok(promocodeRepository.findAll());
    }
    
    @GetMapping("/promocodes/{id}")
    public ResponseEntity<Promocode> getPromocode(@PathVariable Long id) {
        return promocodeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/promocodes")
    @Transactional
    public ResponseEntity<Promocode> createPromocode(@RequestBody Promocode promocode) {
        return ResponseEntity.ok(promocodeRepository.save(promocode));
    }
    
    @PutMapping("/promocodes/{id}")
    @Transactional
    public ResponseEntity<Promocode> updatePromocode(
            @PathVariable Long id,
            @RequestBody Promocode promocode) {
        return promocodeRepository.findById(id)
                .map(existing -> {
                    if (promocode.getCode() != null) existing.setCode(promocode.getCode());
                    if (promocode.getDiscountType() != null) {
                        existing.setDiscountType(promocode.getDiscountType());
                    }
                    if (promocode.getDiscountValue() != null) {
                        existing.setDiscountValue(promocode.getDiscountValue());
                    }
                    if (promocode.getValidFrom() != null) existing.setValidFrom(promocode.getValidFrom());
                    if (promocode.getValidUntil() != null) existing.setValidUntil(promocode.getValidUntil());
                    if (promocode.getUsageLimit() != null) {
                        existing.setUsageLimit(promocode.getUsageLimit());
                    }
                    if (promocode.getUsedCount() != null) {
                        existing.setUsedCount(promocode.getUsedCount());
                    }
                    if (promocode.getIsActive() != null) existing.setIsActive(promocode.getIsActive());
                    return ResponseEntity.ok(promocodeRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/promocodes/{id}/toggle")
    @Transactional
    public ResponseEntity<Promocode> togglePromocode(@PathVariable Long id) {
        return promocodeRepository.findById(id)
                .map(promocode -> {
                    promocode.setIsActive(!promocode.getIsActive());
                    return ResponseEntity.ok(promocodeRepository.save(promocode));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/promocodes/{id}")
    @Transactional
    public ResponseEntity<String> deletePromocode(@PathVariable Long id) {
        return promocodeRepository.findById(id)
                .map(promocode -> {
                    promocodeRepository.delete(promocode);
                    return ResponseEntity.ok("Промокод удален");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ==================== УПРАВЛЕНИЕ НОВОСТЯМИ ====================
    
    @GetMapping("/news")
    public ResponseEntity<Page<News>> getNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(newsRepository.findAll(pageable));
    }
    
    @GetMapping("/news/{id}")
    public ResponseEntity<News> getNewsById(@PathVariable Long id) {
        return newsService.getNewsById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/news")
    @Transactional
    public ResponseEntity<News> createNews(@RequestBody News news) {
        return ResponseEntity.ok(newsService.createNews(news));
    }
    
    @PutMapping("/news/{id}")
    @Transactional
    public ResponseEntity<News> updateNews(
            @PathVariable Long id,
            @RequestBody News news) {
        return ResponseEntity.ok(newsService.updateNews(id, news));
    }
    
    @DeleteMapping("/news/{id}")
    @Transactional
    public ResponseEntity<String> deleteNews(@PathVariable Long id) {
        newsService.deleteNews(id);
        return ResponseEntity.ok("Новость удалена");
    }

    // ==================== УПРАВЛЕНИЕ ТИКЕТАМИ ====================
    
    @GetMapping("/tickets")
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }
    
    @GetMapping("/tickets/{id}")
    public ResponseEntity<Ticket> getTicket(@PathVariable Long id) {
        return ticketService.getTicketById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/tickets/{id}/assign")
    @Transactional
    public ResponseEntity<Ticket> assignTicket(
            @PathVariable Long id,
            @RequestBody AssignTicketRequest request) {
        return ResponseEntity.ok(ticketService.assignAdmin(id, request.getAdminEmail()));
    }
    
    @PutMapping("/tickets/{id}/status")
    @Transactional
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        TicketStatus status = TicketStatus.valueOf(request.getStatus());
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status));
    }

    // ==================== УПРАВЛЕНИЕ БАТЧ-КАРГО ====================
    
    @GetMapping("/batch-cargos")
    public ResponseEntity<List<BatchCargo>> getAllBatchCargos() {
        return ResponseEntity.ok(batchCargoRepository.findAll());
    }
    
    @GetMapping("/batch-cargos/{id}")
    public ResponseEntity<BatchCargo> getBatchCargo(@PathVariable Long id) {
        return batchCargoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/batch-cargos/{id}/status")
    @Transactional
    public ResponseEntity<BatchCargo> updateBatchCargoStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        return batchCargoRepository.findById(id)
                .map(batch -> {
                    String oldStatus = batch.getStatus();
                    batch.setStatus(request.getStatus());
                    BatchCargo savedBatch = batchCargoRepository.save(batch);
                    
                    // Асинхронная отправка уведомлений всем пользователям, чьи заказы входят в сборный груз
                    if (request.getStatus() != null && !request.getStatus().equals(oldStatus)) {
                        final String finalStatus = request.getStatus();
                        final String finalTrackingNumber = savedBatch.getBatchTrackingNumber();
                        
                        // Группируем заказы по пользователям
                        Map<User, List<GmailSenderService.OrderInfo>> userOrdersMap = new HashMap<>();
                        for (Order order : savedBatch.getOrders()) {
                            User user = order.getUser();
                            if (user != null) {
                                userOrdersMap.computeIfAbsent(user, k -> new ArrayList<>())
                                    .add(new GmailSenderService.OrderInfo(
                                        order.getId(),
                                        order.getOrderNumber(),
                                        order.getTotalClientPrice(),
                                        order.getShippingRateFixed()
                                    ));
                            }
                        }
                        
                        // Отправляем уведомления каждому пользователю
                        for (Map.Entry<User, List<GmailSenderService.OrderInfo>> entry : userOrdersMap.entrySet()) {
                            User user = entry.getKey();
                            List<GmailSenderService.OrderInfo> userOrders = entry.getValue();
                            
                            // Асинхронная отправка уведомления на сайте
                            String notificationMessage = String.format(
                                "Статус сборного груза #%d изменён на: %s",
                                id,
                                getBatchStatusText(finalStatus)
                            );
                            notificationService.sendUserNotificationAsync(
                                user,
                                notificationMessage,
                                id,
                                "BATCH_UPDATE"
                            );

                            // Асинхронная отправка email-уведомления (если email верифицирован и флаг уведомлений включен)
                            if (user.getEmailVerified() != null && user.getEmailVerified() &&
                                user.getNotificationsEnabled() != null && user.getNotificationsEnabled()) {
                                gmailSenderService.sendBatchCargoStatusChangeNotification(
                                    user.getEmail(),
                                    id,
                                    finalStatus,
                                    finalTrackingNumber,
                                    userOrders
                                );
                            }
                        }
                    }
                    
                    return ResponseEntity.ok(savedBatch);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private String getBatchStatusText(String status) {
        switch (status) {
            case "UNFINISHED":
                return "Не завершён";
            case "FINISHED":
                return "Готов к отправке";
            case "IN_TRANSIT":
                return "В пути";
            case "AT_CUSTOMS":
                return "На таможне";
            case "ARRIVED_IN_MINSK":
                return "Прибыл в Минск";
            case "DELIVERED":
            case "COMPLETED":
                return "Доставлен";
            case "REFUSED":
                return "Отклонён";
            default:
                return status;
        }
    }

    // ==================== УПРАВЛЕНИЕ ТРАНЗАКЦИЯМИ ====================
    
    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionRepository.findAll());
    }
    
    // ==================== УПРАВЛЕНИЕ ОТЗЫВАМИ ====================
    
    @GetMapping("/reviews")
    public ResponseEntity<List<Review>> getAllReviews() {
        return ResponseEntity.ok(reviewRepository.findAll());
    }
    
    @GetMapping("/product-reviews")
    public ResponseEntity<List<ProductReview>> getAllProductReviews() {
        return ResponseEntity.ok(productReviewRepository.findAll());
    }
    
    @DeleteMapping("/reviews/{id}")
    @Transactional
    public ResponseEntity<String> deleteReview(@PathVariable Long id) {
        return reviewRepository.findById(id)
                .map(review -> {
                    reviewRepository.delete(review);
                    return ResponseEntity.ok("Отзыв удален");
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/product-reviews/{id}")
    @Transactional
    public ResponseEntity<String> deleteProductReview(@PathVariable Long id) {
        return productReviewRepository.findById(id)
                .map(review -> {
                    productReviewRepository.delete(review);
                    return ResponseEntity.ok("Отзыв на товар удален");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ==================== УПРАВЛЕНИЕ КАТАЛОГОМ ====================
    
    @GetMapping("/catalogs")
    public ResponseEntity<Page<Catalog>> getCatalogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(catalogRepository.findAll(pageable));
    }

    // ==================== УПРАВЛЕНИЕ УВЕДОМЛЕНИЯМИ ====================
    
    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationRepository.findAll());
    }
    
    // ==================== DTO КЛАССЫ ====================
    
    @Data
    public static class DashboardStats {
        private long totalUsers;
        private long activeUsers;
        private long newUsersToday;
        private long totalOrders;
        private long pendingOrders;
        private long paidOrders;
        private long completedOrders;
        private long cancelledOrders;
        private long totalProducts;
        private long activeProducts;
        private long pendingProducts;
        private double totalRevenue;
        private long totalTickets;
        private long openTickets;
        private long totalBatchCargos;
        private long unfinishedBatches;
    }
    
    @Data
    public static class RevenueStats {
        private double totalRevenue;
        private long orderCount;
        private double averageOrderValue;
    }
    
    @Data
    public static class UserUpdateRequest {
        private String username;
        private String company;
        private String role;
        private Float discountPercent;
        private Float temporaryDiscountPercent;
        private Boolean notificationsEnabled;
        private Boolean twoFactorEnabled;
        private Boolean emailVerified;
        private String telegramUserId;
        private Boolean telegramVerified;
    }
    
    @Data
    public static class PasswordResetRequest {
        private String newPassword;
    }
    
    @Data
    public static class StatusUpdateRequest {
        private String status;
        private String reasonRefusal;
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getReasonRefusal() { return reasonRefusal; }
        public void setReasonRefusal(String reasonRefusal) { this.reasonRefusal = reasonRefusal; }
    }
    
    @Data
    public static class OrderUpdateRequest {
        private String status;
        private Float totalClientPrice;
        private String trackingNumber;
        private String deliveryAddress;
        private String reasonRefusal;
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Float getTotalClientPrice() { return totalClientPrice; }
        public void setTotalClientPrice(Float totalClientPrice) { this.totalClientPrice = totalClientPrice; }
        public String getTrackingNumber() { return trackingNumber; }
        public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
        public String getDeliveryAddress() { return deliveryAddress; }
        public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
        public String getReasonRefusal() { return reasonRefusal; }
        public void setReasonRefusal(String reasonRefusal) { this.reasonRefusal = reasonRefusal; }
    }
    
    @Data
    public static class AssignTicketRequest {
        private String adminEmail;
    }
}

