package com.example.demo.Services;

import com.example.demo.Entities.Order;
import com.example.demo.Entities.OrderHistory;
import com.example.demo.Entities.OrderItem;
import com.example.demo.Entities.User;
import com.example.demo.Repositories.OrderHistoryRepository;
import com.example.demo.Repositories.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Comprehensive unit tests for OrderService.
 * Tests success scenarios, failure cases, and edge cases.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService Tests")
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderHistoryRepository orderHistoryRepository;

    @InjectMocks
    private OrderService orderService;

    private Order existingOrder;
    private User testUser;
    private OrderItem testOrderItem;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setUsername("testuser");

        // Setup test order item
        testOrderItem = new OrderItem();
        testOrderItem.setId(1L);
        testOrderItem.setQuantity(2);
        testOrderItem.setPriceAtTime(100.0f);

        // Setup existing order
        existingOrder = new Order();
        existingOrder.setId(1L);
        existingOrder.setUser(testUser);
        existingOrder.setOrderNumber("ORD-001");
        existingOrder.setStatus("PENDING");
        existingOrder.setTotalClientPrice(200.0f);
        existingOrder.setDeliveryAddress("123 Test St");
        existingOrder.setTrackingNumber("TRACK-001");
        existingOrder.setDateCreated(new Timestamp(System.currentTimeMillis()));

        List<OrderItem> items = new ArrayList<>();
        items.add(testOrderItem);
        existingOrder.setItems(items);
    }

    @Test
    @DisplayName("Should update order successfully")
    void testUpdateOrder_Success() {
        // Given
        Order updatedOrder = new Order();
        updatedOrder.setStatus("PROCESSING");
        updatedOrder.setReasonRefusal(null);
        updatedOrder.setTotalClientPrice(250.0f);
        updatedOrder.setDeliveryAddress("456 New St");
        updatedOrder.setTrackingNumber("TRACK-002");

        when(orderRepository.findById(1L)).thenReturn(Optional.of(existingOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(existingOrder);

        // When
        Order result = orderService.updateOrder(1L, updatedOrder);

        // Then
        assertNotNull(result);
        assertEquals("PROCESSING", result.getStatus());
        assertEquals(250.0f, result.getTotalClientPrice());
        assertEquals("456 New St", result.getDeliveryAddress());
        assertEquals("TRACK-002", result.getTrackingNumber());
        verify(orderRepository, times(1)).findById(1L);
        verify(orderRepository, times(1)).save(existingOrder);
        verify(orderHistoryRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when order not found")
    void testUpdateOrder_OrderNotFound() {
        // Given
        Order updatedOrder = new Order();
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(EntityNotFoundException.class, () -> {
            orderService.updateOrder(999L, updatedOrder);
        });

        verify(orderRepository, times(1)).findById(999L);
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should create order history when status is REFUSED")
    void testUpdateOrder_CreateHistoryWhenRefused() {
        // Given
        Order updatedOrder = new Order();
        updatedOrder.setStatus("REFUSED");
        updatedOrder.setReasonRefusal("Out of stock");

        when(orderRepository.findById(1L)).thenReturn(Optional.of(existingOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(existingOrder);
        when(orderHistoryRepository.save(any(OrderHistory.class))).thenAnswer(invocation -> {
            OrderHistory history = invocation.getArgument(0);
            return history;
        });

        // When
        Order result = orderService.updateOrder(1L, updatedOrder);

        // Then
        assertNotNull(result);
        assertEquals("REFUSED", result.getStatus());
        verify(orderHistoryRepository, times(1)).save(any(OrderHistory.class));
        verify(orderRepository, times(1)).delete(existingOrder);
    }

    @Test
    @DisplayName("Should create order history when status is RECEIVED")
    void testUpdateOrder_CreateHistoryWhenReceived() {
        // Given
        Order updatedOrder = new Order();
        updatedOrder.setStatus("RECEIVED");

        when(orderRepository.findById(1L)).thenReturn(Optional.of(existingOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(existingOrder);
        when(orderHistoryRepository.save(any(OrderHistory.class))).thenAnswer(invocation -> {
            OrderHistory history = invocation.getArgument(0);
            return history;
        });

        // When
        Order result = orderService.updateOrder(1L, updatedOrder);

        // Then
        assertNotNull(result);
        assertEquals("RECEIVED", result.getStatus());
        verify(orderHistoryRepository, times(1)).save(any(OrderHistory.class));
        verify(orderRepository, times(1)).delete(existingOrder);
    }

    @Test
    @DisplayName("Should preserve order items when creating history")
    void testUpdateOrder_PreserveItemsInHistory() {
        // Given
        Order updatedOrder = new Order();
        updatedOrder.setStatus("REFUSED");

        when(orderRepository.findById(1L)).thenReturn(Optional.of(existingOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(existingOrder);
        when(orderHistoryRepository.save(any(OrderHistory.class))).thenAnswer(invocation -> {
            OrderHistory history = invocation.getArgument(0);
            assertNotNull(history.getItems());
            assertEquals(1, history.getItems().size());
            return history;
        });

        // When
        orderService.updateOrder(1L, updatedOrder);

        // Then
        verify(orderHistoryRepository, times(1)).save(any(OrderHistory.class));
    }

    @Test
    @DisplayName("Should handle order with no items")
    void testUpdateOrder_NoItems() {
        // Given
        existingOrder.setItems(new ArrayList<>());
        Order updatedOrder = new Order();
        updatedOrder.setStatus("REFUSED");

        when(orderRepository.findById(1L)).thenReturn(Optional.of(existingOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(existingOrder);
        when(orderHistoryRepository.save(any(OrderHistory.class))).thenAnswer(invocation -> {
            OrderHistory history = invocation.getArgument(0);
            assertTrue(history.getItems().isEmpty());
            return history;
        });

        // When
        orderService.updateOrder(1L, updatedOrder);

        // Then
        verify(orderHistoryRepository, times(1)).save(any(OrderHistory.class));
    }
}








