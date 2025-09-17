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
import com.example.demo.Services.NotificationService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.sql.Timestamp;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/batch-cargos")
public class BatchCargoController {

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
        List<BatchCargo> batches = batchCargoRepository.findByStatusIn(List.of("FINISHED", "ARRIVED_IN_MINSK", "COMPLETED"));
        List<BatchCargoDTO> dtoList = batches.stream().map(this::mapToBatchCargoDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/departure")
    public ResponseEntity<List<BatchCargoDTO>> getDeparture() {
        String userEmail = ContextHolder.getCurrentUserEmail();
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) {
            return ResponseEntity.status(403).body(List.of());
        }
        List<BatchCargo> batches = batchCargoRepository.findByUser(user);
        List<BatchCargoDTO> dtoList = batches.stream().map(this::mapToBatchCargoDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
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

        BatchCargo finalBatchCargo = batchCargo;
        // Convert purchaseDate to LocalDate for date-only comparison
        java.time.LocalDate purchaseLocalDate = finalBatchCargo.getPurchaseDate()
                .toInstant()
                .atZone(java.time.ZoneId.systemDefault())
                .toLocalDate();

        List<Order> eligibleOrders = orderRepository.findByStatus("VERIFIED").stream()
                .filter(order -> order.getDateCreated() != null && finalBatchCargo.getPurchaseDate() != null)
                .filter(order -> {
                    // Convert order's dateCreated to LocalDate
                    java.time.LocalDate orderLocalDate = order.getDateCreated()
                            .toInstant()
                            .atZone(java.time.ZoneId.systemDefault())
                            .toLocalDate();
                    // Compare dates only (ignore time)
                    return !orderLocalDate.isAfter(purchaseLocalDate);
                })
                .filter(order -> order.getBatchCargo() == null)
                .collect(Collectors.toList());

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

        boolean allOrdersProcessed = eligibleOrders.stream().allMatch(o -> "PROCESSED".equals(o.getStatus()));
        if (allOrdersProcessed && !eligibleOrders.isEmpty()) {
            batchCargo.setStatus("FINISHED");
            batchCargoRepository.save(batchCargo);
            for (Order order : eligibleOrders) {
                User user = userRepository.findByEmail(order.getUser().getEmail()).orElse(null);
                if (user != null) {
                    notificationService.sendUserNotification(
                            user,
                            String.format("Сборный груз #%d завершён и готов к отправке.", batchCargo.getId()),
                            batchCargo.getId(),
                            "BATCH_UPDATE"
                    );
                } else {
                    System.err.println("User not found for email: " + order.getUser().getEmail());
                }
            }
        }

        return ResponseEntity.ok(mapToBatchCargoDTO(batchCargo));
    }

    @GetMapping("/usr/{id}")
    public ResponseEntity<BatchCargoDetailDTO> getUserBatchCargoDetail(@PathVariable Long id) {
        String userEmail = ContextHolder.getCurrentUserEmail();
        BatchCargo batchCargo = batchCargoRepository.findByIdAndUserEmail(id, userEmail).orElse(null);
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

    @GetMapping("/{id}")
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

            batch.setStatus(request.getStatus());
            batch.setReasonRefusal(request.getReasonRefusal());
            batch.setPhotoUrl(request.getPhotoUrl());
            batch.setDescription(request.getDescription());

            BatchCargo savedBatch = batchCargoRepository.save(batch);

            if ("REFUSED".equals(request.getStatus())) {
                for (Order order : batch.getOrders()) {
                    User user = userRepository.findByEmail(order.getUser().getEmail()).orElse(null);
                    if (user != null) {
                        notificationService.sendUserNotification(
                                user,
                                String.format("Сборный груз #%d был отклонён. Причина: %s", id, request.getReasonRefusal()),
                                id,
                                "BATCH_UPDATE"
                        );
                    } else {
                        System.err.println("User not found for email: " + order.getUser().getEmail());
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

    @PutMapping("/{id}/arrived-minsk")
    @Transactional
    public ResponseEntity<BatchCargoDTO> markArrivedInMinsk(@PathVariable Long id) {
        try {
            BatchCargo batch = batchCargoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Batch not found"));
            if (!"FINISHED".equals(batch.getStatus())) {
                return ResponseEntity.badRequest().body(null);
            }

            batch.setStatus("ARRIVED_IN_MINSK");
            BatchCargo savedBatch = batchCargoRepository.save(batch);

            for (Order order : batch.getOrders()) {
                User user = userRepository.findByEmail(order.getUser().getEmail()).orElse(null);
                if (user != null) {
                    notificationService.sendUserNotification(
                            user,
                            String.format("Сборный груз #%d пришел в Минск и уже на Европочте.", id),
                            id,
                            "BATCH_UPDATE"
                    );
                } else {
                    System.err.println("User not found for email: " + order.getUser().getEmail());
                }

                try {
                    SimpleMailMessage message = new SimpleMailMessage();
                    message.setTo(order.getUser().getEmail());
                    message.setSubject("Сборный груз прибыл в Минск");
                    message.setText("Ваш груз из сборного груза прибыл в Минск и уже на Европочте.");
                    mailSender.send(message);
                } catch (Exception mailError) {
                    System.err.println("Failed to send arrived in Minsk email to " + order.getUser().getEmail() + ": " + mailError.getMessage());
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

            for (Order order : batch.getOrders()) {
                User user = userRepository.findByEmail(order.getUser().getEmail()).orElse(null);
                if (user != null) {
                    notificationService.sendUserNotification(
                            user,
                            String.format("Груз #%d доставлен, нужно его забрать.", id),
                            id,
                            "BATCH_UPDATE"
                    );
                } else {
                    System.err.println("User not found for email: " + order.getUser().getEmail());
                }

                try {
                    SimpleMailMessage message = new SimpleMailMessage();
                    message.setTo(order.getUser().getEmail());
                    message.setSubject("Груз доставлен");
                    message.setText("Ваш груз из сборного груза доставлен. Нужно его забрать.");
                    mailSender.send(message);
                } catch (Exception mailError) {
                    System.err.println("Failed to send delivered email to " + order.getUser().getEmail() + ": " + mailError.getMessage());
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
                user.setBalance(user.getBalance() + item.getPriceAtTime() * item.getQuantity());
                userRepository.save(user);
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

            BatchCargo batch = order.getBatchCargo();
            if (batch != null) {
                boolean allOrdersProcessed = batch.getOrders().stream().allMatch(o -> "PROCESSED".equals(o.getStatus()));
                if (allOrdersProcessed) {
                    batch.setStatus("FINISHED");
                    batchCargoRepository.save(batch);
                    for (Order o : batch.getOrders()) {
                        User user = o.getUser();
                        notificationService.sendUserNotification(
                                user,
                                String.format("Сборный груз #%d завершён и готов к отправке.", batch.getId()),
                                batch.getId(),
                                "BATCH_UPDATE"
                        );
                    }
                }
            }
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
    }

    @Data
    static class BatchCargoRequest {
        private Date purchaseDate;
        private String photoUrl;
        private String description;
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
}