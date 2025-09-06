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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/batch-cargos")
public class BatchCargoController {

    @Autowired
    private BatchCargoRepository batchCargoRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/unfinished")
    public ResponseEntity<List<BatchCargoDTO>> getUnfinishedBatches() {
        List<BatchCargo> batches = batchCargoRepository.findUnfinishedBatches();
        List<BatchCargoDTO> dtoList = batches.stream().map(this::mapToBatchCargoDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/finished")
    public ResponseEntity<List<BatchCargoDTO>> getFinishedBatches() {
        List<BatchCargo> batches = batchCargoRepository.findFinishedBatches();
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
        batchCargo = batchCargoRepository.save(batchCargo);

        // Assign all VERIFIED orders with date <= purchaseDate to this batch
        BatchCargo finalBatchCargo = batchCargo;
        List<Order> eligibleOrders = orderRepository.findByStatus("VERIFIED").stream()
                .filter(order -> order.getDateCreated().before(finalBatchCargo.getPurchaseDate()))
                .filter(order -> order.getBatchCargo() == null)
                .collect(Collectors.toList());

        for (Order order : eligibleOrders) {
            order.setBatchCargo(batchCargo);
            for (OrderItem item : order.getItems()) {
                item.setPurchaseStatus("PENDING"); // Initialize purchaseStatus
                orderItemRepository.save(item); // Save each item
            }
            orderRepository.save(order);
        }

        return ResponseEntity.ok(mapToBatchCargoDTO(batchCargo));
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
        dto.setOrders(batchCargo.getOrders().stream().map(this::mapToOrderDTO).collect(Collectors.toList()));

        return ResponseEntity.ok(dto);
    }

    @Autowired
    private OrderItemRepository orderItemRepository;

    @PutMapping("/items/{itemId}")
    @Transactional
    public ResponseEntity<Void> markItemStatus(@PathVariable Long itemId, @RequestBody ItemStatusRequest request) {
        OrderItem item = orderItemRepository.findById(itemId).orElse(null);
        if (item == null) {
            return ResponseEntity.notFound().build();
        }

        item.setPurchaseStatus(request.getStatus());

        if ("NOT_PURCHASED".equals(request.getStatus())) {
            // Refund to user balance
            Order order = item.getOrder();
            User user = order.getUser();
            user.setBalance(user.getBalance() + item.getPriceAtTime() * item.getQuantity());
            userRepository.save(user);
        }

        // Check if all items in order are marked
        Order order = item.getOrder();
        boolean allMarked = order.getItems().stream().allMatch(i -> !"PENDING".equals(i.getPurchaseStatus()));
        if (allMarked) {
            order.setStatus("PROCESSED");
            orderRepository.save(order);

            // Check if all orders in batch are processed
            BatchCargo batch = order.getBatchCargo();
            boolean allOrdersProcessed = batch.getOrders().stream().allMatch(o -> "PROCESSED".equals(o.getStatus()));
            if (allOrdersProcessed) {
                batch.setStatus("FINISHED");
                batchCargoRepository.save(batch);
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
    }

    @Data
    static class BatchCargoRequest {
        private Date purchaseDate;
    }

    @Data
    static class BatchCargoDetailDTO {
        private Long id;
        private Timestamp creationDate;
        private Timestamp purchaseDate;
        private String status;
        private List<OrderDTO> orders;
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
        private Long id; // Add this
        private String productId;
        private String productName;
        private Integer quantity;
        private Float priceAtTime;
        private String url;
        private String imageUrl;
        private String description;
        private Float supplierPrice;
        private String purchaseStatus;
    }

    @Data
    static class ItemStatusRequest {
        private String status; // PURCHASED or NOT_PURCHASED
    }
}