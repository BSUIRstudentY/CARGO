package com.example.demo.Controllers;

import com.example.demo.Components.ContextHolder;
import com.example.demo.Entities.BatchCargo;
import com.example.demo.Entities.Order;
import com.example.demo.Entities.OrderItem;
import com.example.demo.Entities.User;
import com.example.demo.Repositories.BatchCargoRepository;
import com.example.demo.Repositories.OrderItemRepository;
import com.example.demo.Repositories.OrderRepository;
import com.example.demo.Repositories.UserRepository;
import com.example.demo.Services.GmailSenderService;
import com.example.demo.Services.NotificationService;
import com.example.demo.Services.GmailSenderService.OrderInfo;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import jakarta.persistence.EntityNotFoundException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/batch-cargos")
public class BatchCargoController {
    private static final Logger logger = LoggerFactory.getLogger(BatchCargoController.class);

    @Autowired
    private BatchCargoRepository batchCargoRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private GmailSenderService gmailSenderService;
    private final WebClient webClient;

    @Autowired
    public BatchCargoController(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("http://localhost:8080/api").build();

    }

    @GetMapping("/unfinished")
    public ResponseEntity<List<BatchCargoDTO>> getUnfinishedBatches() {
        List<BatchCargo> batches = batchCargoRepository.findUnfinishedBatches();
        List<BatchCargoDTO> dtoList = batches.stream().map(this::mapToBatchCargoDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/finished")
    public ResponseEntity<List<BatchCargoDTO>> getFinishedBatches() {
        // Возвращаем грузы со статусами: отправленные, в Минске, завершенные
        List<BatchCargo> batches = batchCargoRepository.findByStatusIn(List.of("SHIPPED", "ARRIVED_IN_MINSK", "COMPLETED"));
        List<BatchCargoDTO> dtoList = batches.stream().map(this::mapToBatchCargoDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/departure")
    @Transactional(readOnly = true)
    public ResponseEntity<PagedResponse<BatchCargoDTO>> getDeparture(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "creationDate,desc") String sort) {
        String userEmail = ContextHolder.getCurrentUserEmail();
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) {
            return ResponseEntity.status(403).body(new PagedResponse<>(List.of(), page, size, 0, 0, true));
        }
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction sortDirection = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")
                ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortField));
        Page<BatchCargo> batchPage = batchCargoRepository.findByUser(user, pageable);
        List<BatchCargoDTO> batchDTOs = batchPage.getContent().stream()
                .map(this::mapToBatchCargoDTO)
                .collect(Collectors.toList());
        PagedResponse<BatchCargoDTO> response = new PagedResponse<>(
                batchDTOs,
                batchPage.getNumber(),
                batchPage.getSize(),
                batchPage.getTotalElements(),
                batchPage.getTotalPages(),
                batchPage.isLast()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    @Transactional(readOnly = true)
    public ResponseEntity<PagedResponse<BatchCargoDTO>> getAllBatchCargos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "creationDate,desc") String sort) {
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction sortDirection = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")
                ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortField));
        Page<BatchCargo> batchPage = batchCargoRepository.findAll(pageable);
        List<BatchCargoDTO> batchDTOs = batchPage.getContent().stream()
                .map(this::mapToBatchCargoDTO)
                .collect(Collectors.toList());
        PagedResponse<BatchCargoDTO> response = new PagedResponse<>(
                batchDTOs,
                batchPage.getNumber(),
                batchPage.getSize(),
                batchPage.getTotalElements(),
                batchPage.getTotalPages(),
                batchPage.isLast()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/available-orders")
    @Transactional(readOnly = true)
    public ResponseEntity<List<AvailableOrderDTO>> getAvailableOrders() {
        try {
            // Получаем заказы со статусом PAID (оплаченные), которые еще не привязаны к выкупу
            List<Order> allPaidOrders = orderRepository.findByStatus("PAID");
            List<Order> availableOrders = allPaidOrders.stream()
                    .filter(order -> order.getBatchCargo() == null)
                    .collect(Collectors.toList());
            
            List<AvailableOrderDTO> orderDTOs = availableOrders.stream()
                    .map(order -> {
                        try {
                            AvailableOrderDTO dto = new AvailableOrderDTO();
                            dto.setId(order.getId());
                            dto.setOrderNumber(order.getOrderNumber());
                            // Безопасный доступ к user
                            if (order.getUser() != null) {
                                dto.setUserEmail(order.getUser().getEmail());
                            } else {
                                dto.setUserEmail("Unknown");
                            }
                            dto.setTotalClientPrice(order.getTotalClientPrice());
                            // Безопасный доступ к items
                            try {
                                dto.setItemCount(order.getItems() != null ? order.getItems().size() : 0);
                            } catch (Exception e) {
                                logger.warn("Error getting items count for order {}: {}", order.getId(), e.getMessage());
                                dto.setItemCount(0);
                            }
                            dto.setDateCreated(order.getDateCreated());
                            dto.setDeliveryAddress(order.getDeliveryAddress());
                            return dto;
                        } catch (Exception e) {
                            logger.error("Error mapping order {} to DTO: {}", order.getId(), e.getMessage(), e);
                            return null;
                        }
                    })
                    .filter(dto -> dto != null)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(orderDTOs);
        } catch (Exception e) {
            logger.error("Error getting available orders: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping
    @Transactional
    public ResponseEntity<BatchCargoDTO> createBatchCargo(@RequestBody BatchCargoRequest request) {
        BatchCargo batchCargo = new BatchCargo();
        batchCargo.setCreationDate(new Timestamp(System.currentTimeMillis()));
        batchCargo.setPurchaseDate(new Timestamp(request.getPurchaseDate().getTime()));
        batchCargo.setStatus("UNFINISHED");
        batchCargo.setPhotoUrl(request.getPhotoUrl());
        batchCargo.setDescription(request.getDescription());
        batchCargo = batchCargoRepository.save(batchCargo);
        
        // Если передан список orderIds, используем их, иначе находим автоматически (обратная совместимость)
        List<Order> eligibleOrders;
        if (request.getOrderIds() != null && !request.getOrderIds().isEmpty()) {
            // Используем переданные orderIds, фильтруем только оплаченные заказы (PAID)
            eligibleOrders = request.getOrderIds().stream()
                    .map(orderId -> orderRepository.findById(orderId))
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .filter(order -> "PAID".equals(order.getStatus()))
                    .filter(order -> order.getBatchCargo() == null)
                    .collect(Collectors.toList());
        } else {
            // Старая логика для обратной совместимости (только оплаченные заказы)
            BatchCargo finalBatchCargo = batchCargo;
            java.time.LocalDate purchaseLocalDate = finalBatchCargo.getPurchaseDate()
                    .toInstant()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDate();
            eligibleOrders = orderRepository.findByStatus("PAID").stream()
                    .filter(order -> order.getDateCreated() != null && finalBatchCargo.getPurchaseDate() != null)
                    .filter(order -> {
                        java.time.LocalDate orderLocalDate = order.getDateCreated()
                                .toInstant()
                                .atZone(java.time.ZoneId.systemDefault())
                                .toLocalDate();
                        return !orderLocalDate.isAfter(purchaseLocalDate);
                    })
                    .filter(order -> order.getBatchCargo() == null)
                    .collect(Collectors.toList());
        }
        
        for (Order order : eligibleOrders) {
            order.setBatchCargo(batchCargo);
            boolean allItemsProcessed = order.getItems().stream().allMatch(i ->
                    "PURCHASED".equals(i.getPurchaseStatus()) || "NOT_PURCHASED".equals(i.getPurchaseStatus()));
            if (allItemsProcessed) {
                order.setStatus("PROCESSED");
            } else {
                for (OrderItem item : order.getItems()) {
                    if (item.getPurchaseStatus() == null || "PENDING".equals(item.getPurchaseStatus())) {
                        item.setPurchaseStatus("PENDING");
                        orderItemRepository.save(item);
                    }
                }
            }
            orderRepository.save(order);
        }
        // Статус сборного груза теперь устанавливается вручную админом, не меняется автоматически
        return ResponseEntity.ok(mapToBatchCargoDTO(batchCargo));
    }

    @GetMapping("/usr/{id:\\d+}")
    @Transactional
    public ResponseEntity<BatchCargoDetailDTO> getUserBatchCargoDetail(@PathVariable Long id) {
        String userEmail = ContextHolder.getCurrentUserEmail();
        BatchCargo batchCargo = batchCargoRepository.findById(id).orElse(null);
        if (batchCargo == null) {
            return ResponseEntity.notFound().build();
        }
        BatchCargoDetailDTO dto = new BatchCargoDetailDTO();
        dto.setId(batchCargo.getId());
        dto.setCreationDate(batchCargo.getCreationDate());
        dto.setPurchaseDate(batchCargo.getPurchaseDate());
        dto.setStatus(batchCargo.getStatus());
        dto.setReasonRefusal(batchCargo.getReasonRefusal());
        dto.setPhotoUrl(batchCargo.getPhotoUrl());
        dto.setDescription(batchCargo.getDescription());
        // Фильтруем заказы - показываем только заказы текущего пользователя
        dto.setOrders(batchCargo.getOrders().stream()
                .filter(order -> order.getUser().getEmail().equals(userEmail))
                .map(this::mapToOrderDTO)
                .collect(Collectors.toList()));
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id:\\d+}")
    @Transactional
    public ResponseEntity<BatchCargoDetailDTO> getBatchCargoDetail(@PathVariable Long id) {
        BatchCargo batchCargo = batchCargoRepository.findById(id).orElse(null);
        if (batchCargo == null) {
            return ResponseEntity.notFound().build();
        }
        BatchCargoDetailDTO dto = new BatchCargoDetailDTO();
        dto.setId(batchCargo.getId());
        dto.setCreationDate(batchCargo.getCreationDate());
        dto.setPurchaseDate(batchCargo.getPurchaseDate());
        dto.setStatus(batchCargo.getStatus());
        dto.setReasonRefusal(batchCargo.getReasonRefusal());
        dto.setPhotoUrl(batchCargo.getPhotoUrl());
        dto.setDescription(batchCargo.getDescription());
        dto.setOrders(batchCargo.getOrders().stream().map(this::mapToOrderDTO).collect(Collectors.toList()));
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<BatchCargoDTO> updateBatchCargo(@PathVariable Long id, @RequestBody UpdateBatchCargoRequest request) {
        try {
            BatchCargo batch = batchCargoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Batch not found"));
            String oldStatus = batch.getStatus(); // Сохраняем старый статус ДО изменения
            
            if (request.getStatus() != null) {
                batch.setStatus(request.getStatus());
            }
            if (request.getReasonRefusal() != null) {
                batch.setReasonRefusal(request.getReasonRefusal());
            }
            if (request.getPhotoUrl() != null) {
                batch.setPhotoUrl(request.getPhotoUrl());
            }
            if (request.getDescription() != null) {
                batch.setDescription(request.getDescription());
            }
            
            // Обновление логистических полей
            if (request.getBatchTrackingNumber() != null) {
                batch.setBatchTrackingNumber(request.getBatchTrackingNumber());
            }
            if (request.getChinaWarehouseAddress() != null) {
                batch.setChinaWarehouseAddress(request.getChinaWarehouseAddress());
            }
            if (request.getConsolidationWarehouse() != null) {
                batch.setConsolidationWarehouse(request.getConsolidationWarehouse());
            }
            if (request.getShippingMethod() != null) {
                batch.setShippingMethod(request.getShippingMethod());
            }
            if (request.getCarrierName() != null) {
                batch.setCarrierName(request.getCarrierName());
            }
            if (request.getCustomsDeclarationNumber() != null) {
                batch.setCustomsDeclarationNumber(request.getCustomsDeclarationNumber());
            }
            if (request.getCustomsStatus() != null) {
                batch.setCustomsStatus(request.getCustomsStatus());
            }
            if (request.getTotalBatchWeight() != null) {
                batch.setTotalBatchWeight(request.getTotalBatchWeight());
            }
            if (request.getTotalBatchValue() != null) {
                batch.setTotalBatchValue(request.getTotalBatchValue());
            }
            
            BatchCargo savedBatch = batchCargoRepository.save(batch);
            
            // Асинхронная отправка уведомлений всем пользователям, чьи заказы входят в сборный груз
            if (request.getStatus() != null && !request.getStatus().equals(oldStatus)) {
                final String finalStatus = request.getStatus();
                final String finalReasonRefusal = request.getReasonRefusal();
                final String finalTrackingNumber = savedBatch.getBatchTrackingNumber();
                
                // Группируем заказы по пользователям
                Map<User, List<GmailSenderService.OrderInfo>> userOrdersMap = new HashMap<>();
                for (Order order : savedBatch.getOrders()) {
                    User user = order.getUser();
                    if (user != null) {
                            userOrdersMap.computeIfAbsent(user, k -> new ArrayList<>())
                            .add(new OrderInfo(
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
                    if ("REFUSED".equals(finalStatus) && finalReasonRefusal != null) {
                        notificationMessage += ". Причина: " + finalReasonRefusal;
                    }
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
            return ResponseEntity.ok(mapToBatchCargoDTO(savedBatch));
        } catch (RuntimeException e) {
            System.err.println("Batch not found for id " + id + ": " + e.getMessage());
            return ResponseEntity.status(404).body(null);
        } catch (Exception e) {
            System.err.println("Error updating batch cargo " + id + ": " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
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

    @PutMapping("/{id}/arrived-minsk")
    @Transactional
    public ResponseEntity<BatchCargoDTO> markArrivedInMinsk(@PathVariable Long id) {
        try {
            BatchCargo batch = batchCargoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Batch not found"));
            // Убрана проверка на FINISHED, так как статусы теперь управляются вручную
            batch.setStatus("ARRIVED_IN_MINSK");
            BatchCargo savedBatch = batchCargoRepository.save(batch);
            
            // Группируем заказы по пользователям
            Map<User, List<OrderInfo>> userOrdersMap = new HashMap<>();
            for (Order order : batch.getOrders()) {
                User user = order.getUser();
                if (user != null) {
                    userOrdersMap.computeIfAbsent(user, k -> new ArrayList<>())
                        .add(new OrderInfo(
                            order.getId(),
                            order.getOrderNumber(),
                            order.getTotalClientPrice(),
                            order.getShippingRateFixed()
                        ));
                }
            }
            
            // Отправляем уведомления каждому пользователю
            for (Map.Entry<User, List<OrderInfo>> entry : userOrdersMap.entrySet()) {
                User user = entry.getKey();
                List<OrderInfo> userOrders = entry.getValue();
                
                // Асинхронная отправка уведомления на сайте
                notificationService.sendUserNotificationAsync(
                        user,
                        String.format("Сборный груз #%d пришел в Минск и уже на Европочте.", id),
                        id,
                        "BATCH_UPDATE"
                );

                // Асинхронная отправка email-уведомления (если email верифицирован и флаг уведомлений включен)
                if (user.getEmailVerified() != null && user.getEmailVerified() &&
                    user.getNotificationsEnabled() != null && user.getNotificationsEnabled()) {
                    gmailSenderService.sendBatchCargoStatusChangeNotification(
                        user.getEmail(),
                        id,
                        "ARRIVED_IN_MINSK",
                        savedBatch.getBatchTrackingNumber(),
                        userOrders
                    );
                }
            }
            return ResponseEntity.ok(mapToBatchCargoDTO(savedBatch));
        } catch (RuntimeException e) {
            System.err.println("Batch not found for id " + id + ": " + e.getMessage());
            return ResponseEntity.status(404).body(null);
        } catch (Exception e) {
            System.err.println("Error marking batch as arrived in Minsk " + id + ": " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{id}/delivered")
    @Transactional
    public ResponseEntity<BatchCargoDTO> markDelivered(@PathVariable Long id) {
        try {
            BatchCargo batch = batchCargoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Batch not found"));
            if (!"ARRIVED_IN_MINSK".equals(batch.getStatus())) {
                return ResponseEntity.badRequest().body(null);
            }
            batch.setStatus("COMPLETED");
            BatchCargo savedBatch = batchCargoRepository.save(batch);
            
            // Группируем заказы по пользователям
            Map<User, List<OrderInfo>> userOrdersMap = new HashMap<>();
            for (Order order : batch.getOrders()) {
                User user = order.getUser();
                if (user != null) {
                    userOrdersMap.computeIfAbsent(user, k -> new ArrayList<>())
                        .add(new OrderInfo(
                            order.getId(),
                            order.getOrderNumber(),
                            order.getTotalClientPrice(),
                            order.getShippingRateFixed()
                        ));
                }
            }
            
            // Отправляем уведомления каждому пользователю
            for (Map.Entry<User, List<OrderInfo>> entry : userOrdersMap.entrySet()) {
                User user = entry.getKey();
                List<OrderInfo> userOrders = entry.getValue();
                
                // Асинхронная отправка уведомления на сайте
                notificationService.sendUserNotificationAsync(
                        user,
                        String.format("Груз #%d доставлен, нужно его забрать.", id),
                        id,
                        "BATCH_UPDATE"
                );

                // Асинхронная отправка email-уведомления (если email верифицирован и флаг уведомлений включен)
                if (user.getEmailVerified() != null && user.getEmailVerified() &&
                    user.getNotificationsEnabled() != null && user.getNotificationsEnabled()) {
                    gmailSenderService.sendBatchCargoStatusChangeNotification(
                        user.getEmail(),
                        id,
                        "COMPLETED",
                        savedBatch.getBatchTrackingNumber(),
                        userOrders
                    );
                }
            }
            return ResponseEntity.ok(mapToBatchCargoDTO(savedBatch));
        } catch (RuntimeException e) {
            System.err.println("Batch not found for id " + id + ": " + e.getMessage());
            return ResponseEntity.status(404).body(null);
        } catch (Exception e) {
            System.err.println("Error marking batch as delivered " + id + ": " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteBatchCargo(@PathVariable Long id) {
        try {
            BatchCargo batch = batchCargoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Batch not found"));
            List<Order> orders = batch.getOrders();
            for (Order order : orders) {
                order.setBatchCargo(null);
                if (!"DELIVERED".equals(order.getStatus()) && !"CANCELLED".equals(order.getStatus())) {
                    order.setStatus("VERIFIED");
                }
                orderRepository.save(order);
            }
            batchCargoRepository.delete(batch);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            System.err.println("Batch not found for id " + id + ": " + e.getMessage());
            return ResponseEntity.status(404).build();
        } catch (Exception e) {
            System.err.println("Error deleting batch cargo " + id + ": " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/items/{itemId}/tracking")
    @Transactional
    public ResponseEntity<Void> updateItemTracking(@PathVariable Long itemId, @RequestBody ItemTrackingRequest request) {
        OrderItem item = orderItemRepository.findById(itemId).orElse(null);
        if (item == null) {
            return ResponseEntity.notFound().build();
        }
        if (request.getTrackingNumber() != null) {
            item.setTrackingNumber(request.getTrackingNumber());
        }
        orderItemRepository.save(item);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/items/{itemId}")
    @Transactional
    public ResponseEntity<Void> markItemStatus(@PathVariable Long itemId, @RequestBody ItemStatusRequest request) {
        OrderItem item = orderItemRepository.findById(itemId).orElse(null);
        if (item == null) {
            return ResponseEntity.notFound().build();
        }
        String status = request.getStatus();
        if (!List.of("PURCHASED", "NOT_PURCHASED").contains(status)) {
            return ResponseEntity.badRequest().body(null);
        }
        item.setPurchaseStatus(status);
        if ("NOT_PURCHASED".equals(status)) {
            item.setPurchaseRefusalReason(request.getPurchaseRefusalReason());
            Order order = item.getOrder();
            if (order.getTotalClientPrice() > 0) {
                User user = order.getUser();
            }
            User notificationUser = order.getUser();
            String productName = item.getProduct() != null ? item.getProduct().getName() :
                    (item.getTrackingNumber() != null ? "Self-Pickup: " + item.getTrackingNumber() : "Unknown");
            notificationService.sendUserNotification(
                    notificationUser,
                    String.format("Товар #%d (%s) в заказе #%s не выкуплен. Причина: %s",
                            itemId, productName, order.getOrderNumber(), request.getPurchaseRefusalReason()),
                    order.getId(),
                    "ORDER_UPDATE"
            );
        }
        orderItemRepository.save(item);
        Order order = item.getOrder();
        boolean allItemsProcessed = order.getItems().stream().allMatch(i ->
                "PURCHASED".equals(i.getPurchaseStatus()) || "NOT_PURCHASED".equals(i.getPurchaseStatus()));
        if (allItemsProcessed) {
            order.setStatus("PROCESSED");
            orderRepository.save(order);
            // Статус сборного груза теперь устанавливается вручную админом, не меняется автоматически
        }
        return ResponseEntity.ok().build();
    }

    private BatchCargoDTO mapToBatchCargoDTO(BatchCargo batchCargo) {
        BatchCargoDTO dto = new BatchCargoDTO();
        dto.setId(batchCargo.getId());
        dto.setCreationDate(batchCargo.getCreationDate());
        dto.setPurchaseDate(batchCargo.getPurchaseDate());
        dto.setStatus(batchCargo.getStatus());
        dto.setPhotoUrl(batchCargo.getPhotoUrl());
        dto.setDescription(batchCargo.getDescription());
        // Устанавливаем количество заказов: сначала пробуем из поля orderCount, если нет - считаем из orders
        int orderCount = 0;
        if (batchCargo.getOrderCount() != null) {
            orderCount = batchCargo.getOrderCount();
        } else {
            try {
                orderCount = batchCargo.getOrders() != null ? batchCargo.getOrders().size() : 0;
            } catch (Exception e) {
                // Если orders не загружены (lazy loading), используем 0 или можем загрузить явно
                logger.warn("Could not get order count from orders list for batch {}: {}", batchCargo.getId(), e.getMessage());
                orderCount = 0;
            }
        }
        dto.setOrderCount(orderCount);
        // Включаем список заказов для обратной совместимости, но оставляем пустым для оптимизации (не загружаем все заказы)
        dto.setOrders(List.of());
        return dto;
    }

    private OrderDTO mapToOrderDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setDateCreated(order.getDateCreated());
        dto.setStatus(order.getStatus());
        dto.setTotalClientPrice(order.getTotalClientPrice());
        dto.setDeliveryAddress(order.getDeliveryAddress());
        dto.setReasonRefusal(order.getReasonRefusal());
        boolean isSelfPickup = order.getTotalClientPrice() == 0;
        dto.setItems(order.getItems().stream()
                .map(item -> {
                    OrderItemDTO itemDTO = new OrderItemDTO();
                    itemDTO.setId(item.getId());
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setPriceAtTime(item.getPriceAtTime());
                    itemDTO.setSupplierPrice(item.getSupplierPrice());
                    itemDTO.setPurchaseStatus(item.getPurchaseStatus() != null ? item.getPurchaseStatus() : "PENDING");
                    itemDTO.setPurchaseRefusalReason(item.getPurchaseRefusalReason());
                    itemDTO.setTrackingNumber(item.getTrackingNumber());
                    if (isSelfPickup || item.getProduct() == null) {
                        itemDTO.setProductId(null);
                        itemDTO.setProductName(item.getTrackingNumber() != null ? "Self-Pickup: " + item.getTrackingNumber() : "Unknown");
                        itemDTO.setUrl(null);
                        itemDTO.setImageUrl(null);
                        itemDTO.setDescription(null);
                    } else {
                        try {
                            itemDTO.setProductId(item.getProduct().getId().toString());
                            itemDTO.setProductName(item.getProduct().getName());
                            itemDTO.setUrl(item.getProduct().getUrl());
                            itemDTO.setImageUrl(item.getProduct().getImageUrl() != null ? item.getProduct().getImageUrl() : "https://placehold.co/128x128?text=No+Image");
                            itemDTO.setDescription(item.getProduct().getDescription());
                        } catch (EntityNotFoundException e) {
                            System.err.println("Product not found for OrderItem ID: " + item.getId() + " in Order ID: " + order.getId());
                            itemDTO.setProductId(null);
                            itemDTO.setProductName("Deleted Product");
                            itemDTO.setUrl(null);
                            itemDTO.setImageUrl("https://placehold.co/128x128?text=Deleted+Product");
                            itemDTO.setDescription("This product has been removed from the catalog");
                        } catch (NullPointerException e) {
                            System.err.println("Null product for OrderItem ID: " + item.getId() + " in Order ID: " + order.getId());
                            itemDTO.setProductId(null);
                            itemDTO.setProductName("Unknown");
                            itemDTO.setUrl(null);
                            itemDTO.setImageUrl("https://placehold.co/128x128?text=No+Image");
                            itemDTO.setDescription(null);
                        }
                    }
                    return itemDTO;
                })
                .collect(Collectors.toList()));
        dto.setUserEmail(order.getUser().getEmail());
        dto.setPaymentMethod(order.getPaymentMethod());
        return dto;
    }

    @Data
    static class BatchCargoDTO {
        private Long id;
        private Timestamp creationDate;
        private Timestamp purchaseDate;
        private String status;
        private String photoUrl;
        private String description;
        private Integer orderCount;
        private List<OrderDTO> orders;
    }

    @Data
    static class BatchCargoRequest {
        private Date purchaseDate;
        private String photoUrl;
        private String description;
        private List<Long> orderIds; // Список ID заказов для включения в выкуп
    }

    @Data
    static class AvailableOrderDTO {
        private Long id;
        private String orderNumber;
        private String userEmail;
        private Float totalClientPrice;
        private Integer itemCount;
        private Timestamp dateCreated;
        private String deliveryAddress;
    }

    @Data
    static class BatchCargoDetailDTO {
        private Long id;
        private Timestamp creationDate;
        private Timestamp purchaseDate;
        private String status;
        private String reasonRefusal;
        private String photoUrl;
        private String description;
        private List<OrderDTO> orders;
    }

    @Data
    static class UpdateBatchCargoRequest {
        private String photoUrl;
        private String description;
        private String status;
        private String reasonRefusal;
        private String batchTrackingNumber;
        private String chinaWarehouseAddress;
        private String consolidationWarehouse;
        private String shippingMethod;
        private String carrierName;
        private String customsDeclarationNumber;
        private String customsStatus;
        private Float totalBatchWeight;
        private Float totalBatchValue;
    }

    @Data
    static class OrderDTO {
        private Long id;
        private String orderNumber;
        private Timestamp dateCreated;
        private String status;
        private Float totalClientPrice;
        private String deliveryAddress;
        private String reasonRefusal;
        private List<OrderItemDTO> items;
        private String userEmail;
        private String paymentMethod; // NO_BALANCE (обычная оплата)
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
    }

    @Data
    static class ItemStatusRequest {
        private String status;
        private String purchaseRefusalReason;
    }

    @Data
    static class ItemTrackingRequest {
        private String trackingNumber;
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