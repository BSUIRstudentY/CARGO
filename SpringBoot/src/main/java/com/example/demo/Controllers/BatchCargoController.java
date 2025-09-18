package com.example.demo.Controllers;

// [Импорты остаются без изменений, используем все из обоих вариантов]
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
    @Transactional(readOnly = true)
    public ResponseEntity<?> getDeparture(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "creationDate,desc") String sort,
            @RequestParam(defaultValue = "false") boolean all) {
        String userEmail = ContextHolder.getCurrentUserEmail();
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) {
            return ResponseEntity.status(403).body(new PagedResponse<>(List.of(), 0, size, 0, 0, true));
        }

        if (all) {
            // Возвращаем весь список (функционал из main)
            List<BatchCargo> batches = batchCargoRepository.findByUser(user);
            List<BatchCargoDTO> dtoList = batches.stream().map(this::mapToBatchCargoDTO).collect(Collectors.toList());
            return ResponseEntity.ok(dtoList);
        } else {
            // Возвращаем с пагинацией (функционал из HEAD)
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
    }

    // [Остальной код остаётся без изменений, включая методы createBatchCargo, getUserBatchCargoDetail и т.д.]

    // DTO и PagedResponse классы
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

    public static class PagedResponse<T> {
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

        public List<T> getContent() {
            return content;
        }

        public int getPage() {
            return page;
        }

        public int getSize() {
            return size;
        }

        public long getTotalElements() {
            return totalElements;
        }

        public int getTotalPages() {
            return totalPages;
        }

        public boolean isLast() {
            return last;
        }
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
}