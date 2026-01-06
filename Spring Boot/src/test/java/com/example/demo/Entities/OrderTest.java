package com.example.demo.Entities;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for Order entity business logic.
 * Tests weight calculations, state checks, and cancellation logic.
 */
@DisplayName("Order Entity Tests")
class OrderTest {

    private Order order;
    private User user;
    private Product product1;
    private Product product2;
    private OrderItem item1;
    private OrderItem item2;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setEmail("test@example.com");

        order = new Order();
        order.setId(1L);
        order.setUser(user);
        order.setOrderNumber("ORD-001");
        order.setStatus("PENDING");
        order.setDateCreated(new Timestamp(System.currentTimeMillis()));

        product1 = new Product();
        product1.setId("PROD-001");
        product1.setWeightKg(1.0f);

        product2 = new Product();
        product2.setId("PROD-002");
        product2.setWeightKg(2.0f);

        item1 = new OrderItem();
        item1.setProduct(product1);
        item1.setQuantity(2);

        item2 = new OrderItem();
        item2.setProduct(product2);
        item2.setQuantity(1);

        List<OrderItem> items = new ArrayList<>();
        items.add(item1);
        items.add(item2);
        order.setItems(items);
    }

    @Test
    @DisplayName("Should calculate total weight from items")
    void testCalculateTotalWeight() {
        // When
        Float totalWeight = order.calculateTotalWeight();

        // Then
        assertEquals(4.0f, totalWeight, 0.01f); // (1.0 * 2) + (2.0 * 1) = 4.0
    }

    @Test
    @DisplayName("Should return stored weight when no items")
    void testCalculateTotalWeight_NoItems() {
        // Given
        order.setItems(new ArrayList<>());
        order.setWeight(5.0f);

        // When
        Float totalWeight = order.calculateTotalWeight();

        // Then
        assertEquals(5.0f, totalWeight, 0.01f);
    }

    @Test
    @DisplayName("Should return zero when no items and no weight")
    void testCalculateTotalWeight_NoItemsNoWeight() {
        // Given
        order.setItems(new ArrayList<>());
        order.setWeight(null);

        // When
        Float totalWeight = order.calculateTotalWeight();

        // Then
        assertEquals(0.0f, totalWeight, 0.01f);
    }

    @Test
    @DisplayName("Should identify terminal states correctly")
    void testIsTerminalState() {
        // Test completed
        order.setStatus("COMPLETED");
        assertTrue(order.isTerminalState());

        // Test cancelled
        order.setStatus("CANCELLED");
        assertTrue(order.isTerminalState());

        // Test refunded
        order.setStatus("REFUNDED");
        assertTrue(order.isTerminalState());

        // Test non-terminal states
        order.setStatus("PENDING");
        assertFalse(order.isTerminalState());

        order.setStatus("PROCESSING");
        assertFalse(order.isTerminalState());

        order.setStatus("SHIPPED");
        assertFalse(order.isTerminalState());
    }

    @Test
    @DisplayName("Should allow cancellation for pending orders")
    void testCanBeCancelled_Pending() {
        // Given
        order.setStatus("PENDING");

        // When & Then
        assertTrue(order.canBeCancelled());
    }

    @Test
    @DisplayName("Should not allow cancellation for shipped orders")
    void testCanBeCancelled_Shipped() {
        // Given
        order.setStatus("SHIPPED");

        // When & Then
        assertFalse(order.canBeCancelled());
    }

    @Test
    @DisplayName("Should not allow cancellation for in-transit orders")
    void testCanBeCancelled_InTransit() {
        // Given
        order.setStatus("IN_TRANSIT");

        // When & Then
        assertFalse(order.canBeCancelled());
    }

    @Test
    @DisplayName("Should not allow cancellation for completed orders")
    void testCanBeCancelled_Completed() {
        // Given
        order.setStatus("COMPLETED");

        // When & Then
        assertFalse(order.canBeCancelled());
    }
}








