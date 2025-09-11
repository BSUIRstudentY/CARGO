package com.example.demo.Controllers;

import com.example.demo.Entities.BatchCargo;
import com.example.demo.Entities.Order;
import com.example.demo.Entities.OrderItem;
import com.example.demo.Entities.User;
import com.example.demo.Repositories.BatchCargoRepository;
import com.example.demo.Repositories.OrderItemRepository;
import com.example.demo.Repositories.OrderRepository;
import com.example.demo.Repositories.UserRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.sql.Timestamp;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class BatchCargoController {

    @Autowired
    private BatchCargoRepository batchCargoRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    private final WebClient webClient;

    @Autowired
    public BatchCargoController(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("http://localhost:8080/api").build();
    }

    @GetMapping("/batch-cargos/unfinished")
    public ResponseEntity<List<BatchCargoDTO>> getUnfinishedBatches() {
        List<BatchCargo> batches = batchCargoRepository.findUnfinishedBatches();
        List<BatchCargoDTO> dtoList = batches.stream().map(this::mapToBatchCargoDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/batch-cargos/finished")
    public ResponseEntity<List<BatchCargoDTO>> getFinishedBatches() {
        List<BatchCargo> batches = batchCargoRepository.findFinishedBatches();
        List<BatchCargoDTO> dtoList = batches.stream().map(this::mapToBatchCargoDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @PostMapping("/batch-cargos")
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
        List<Order> eligibleOrders = orderRepository.findByStatus("VERIFIED").stream()
                .filter(order -> order.getDateCreated() != null && finalBatchCargo.getCreationDate() != null)
                .filter(order -> order.getDateCreated().compareTo(finalBatchCargo.getCreationDate()) <= 0)
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

        // Check if all orders are PROCESSED to set batch status to FINISHED
        boolean allOrdersProcessed = eligibleOrders.stream().allMatch(o -> "PROCESSED".equals(o.getStatus()));
        if (allOrdersProcessed && !eligibleOrders.isEmpty()) {
            batchCargo.setStatus("FINISHED");
            batchCargoRepository.save(batchCargo);
            // Send notification for FINISHED batch
            for (Order order : eligibleOrders) {
                Map<String, Object> notification = new HashMap<>();
                notification.put("userEmail", order.getUser().getEmail());
                notification.put("message", String.format("Сборный груз #%d завершён и готов к отправке.", batchCargo.getId()));
                notification.put("relatedId", batchCargo.getId());
                notification.put("category", "BATCH_UPDATE");
                webClient.post()
                        .uri("/notifications")
                        .body(Mono.just(notification), Map.class)
                        .retrieve()
                        .bodyToMono(Void.class)
                        .doOnError(error -> System.err.println("Failed to send notification for order %d: %s"))
                        .subscribe();
            }
        }

        return ResponseEntity.ok(mapToBatchCargoDTO(batchCargo));
    }

    @GetMapping("/batch-cargos/{id}")
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
        dto.setOrders(batchCargo.getOrders().stream().map(this::mapToOrderDTO).collect(Collectors.toList()));
        dto.setPhotoUrl(batchCargo.getPhotoUrl());
        dto.setDescription(batchCargo.getDescription());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/batch-cargos/{id}")
    @Transactional
    public ResponseEntity<BatchCargoDTO> updateBatchCargo(@PathVariable Long id, @RequestBody UpdateBatchCargoRequest updatedBatch) {
        try {
            BatchCargo batch = batchCargoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Batch not found"));

            batch.setStatus(updatedBatch.getStatus());
            batch.setReasonRefusal(updatedBatch.getReasonRefusal());
            batch.setPhotoUrl(updatedBatch.getPhotoUrl());
            batch.setDescription(updatedBatch.getDescription());

            BatchCargo savedBatch = batchCargoRepository.save(batch);

            if ("REFUSED".equals(updatedBatch.getStatus())) {
                for (Order order : batch.getOrders()) {
                    Map<String, Object> notification = new HashMap<>();
                    notification.put("userEmail", order.getUser().getEmail());
                    notification.put("message", String.format("Сборный груз #%d был отклонён. Причина: %s", id, updatedBatch.getReasonRefusal()));
                    notification.put("relatedId", id);
                    notification.put("category", "BATCH_UPDATE");

                    webClient.post()
                            .uri("/notifications")
                            .body(Mono.just(notification), Map.class)
                            .retrieve()
                            .bodyToMono(Void.class)
                            .doOnError(error -> System.err.println("Failed to send notification for order %d: %s"))
                            .subscribe();
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

    @DeleteMapping("/batch-cargos/{id}")
    @Transactional
    public ResponseEntity<Void> deleteBatchCargo(@PathVariable Long id) {
        try {
            BatchCargo batch = batchCargoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Batch not found"));

            // Disassociate orders from the batch and reset status to VERIFIED
            List<Order> orders = batch.getOrders();
            for (Order order : orders) {
                order.setBatchCargo(null);
                if (!"DELIVERED".equals(order.getStatus()) && !"CANCELLED".equals(order.getStatus())) {
                    order.setStatus("VERIFIED");
                }
                orderRepository.save(order);
            }

            // Delete the batch
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

        item.setPurchaseStatus(request.getStatus());
        if ("NOT_PURCHASED".equals(request.getStatus())) {
            item.setPurchaseRefusalReason(request.getPurchaseRefusalReason());
            Order order = item.getOrder();
            User user = order.getUser();
            user.setBalance(user.getBalance() + item.getPriceAtTime() * item.getQuantity());
            userRepository.save(user);

            Map<String, Object> notification = new HashMap<>();
            notification.put("userEmail", order.getUser().getEmail());
            notification.put("message", String.format("Товар #%d в заказе #%s не выкуплен. Причина: %s", itemId, order.getOrderNumber(), request.getPurchaseRefusalReason()));
            notification.put("relatedId", order.getId());
            notification.put("category", "ORDER_UPDATE");

            webClient.post()
                    .uri("/notifications")
                    .body(Mono.just(notification), Map.class)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .doOnError(error -> System.err.println("Failed to send notification: " + error.getMessage()))
                    .subscribe();
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
                    // Send notification for FINISHED batch
                    for (Order o : batch.getOrders()) {
                        Map<String, Object> notification = new HashMap<>();
                        notification.put("userEmail", o.getUser().getEmail());
                        notification.put("message", String.format("Сборный груз #%d завершён и готов к отправке.", batch.getId()));
                        notification.put("relatedId", batch.getId());
                        notification.put("category", "BATCH_UPDATE");
                        webClient.post()
                                .uri("/notifications")
                                .body(Mono.just(notification), Map.class)
                                .retrieve()
                                .bodyToMono(Void.class)
                                .doOnError(error -> System.err.println("Failed to send notification for order %d: %s"))
                                .subscribe();
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
        dto.setItems(order.getItems().stream()
                .map(item -> {
                    OrderItemDTO itemDTO = new OrderItemDTO();
                    itemDTO.setId(item.getId());
                    itemDTO.setProductId(item.getProduct().getId());
                    itemDTO.setProductName(item.getProduct().getName());
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setPriceAtTime(item.getPriceAtTime());
                    itemDTO.setUrl(item.getProduct().getUrl());
                    itemDTO.setImageUrl(item.getProduct().getImageUrl());
                    itemDTO.setDescription(item.getProduct().getDescription());
                    itemDTO.setSupplierPrice(item.getSupplierPrice());
                    itemDTO.setPurchaseStatus(item.getPurchaseStatus() != null ? item.getPurchaseStatus() : "PENDING");
                    itemDTO.setPurchaseRefusalReason(item.getPurchaseRefusalReason());
                    return itemDTO;
                })
                .collect(Collectors.toList()));
        dto.setUserEmail(order.getUser().getEmail());
        return dto;
    }

    // DTO classes
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
    static class BatchCargoDetailDTO {
        private Long id;
        private Timestamp creationDate;
        private Timestamp purchaseDate;
        private String status;
        private String reasonRefusal;
        private List<OrderDTO> orders;
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
    }

    @Data
    static class ItemStatusRequest {
        private String status;
        private String purchaseRefusalReason;
    }
}