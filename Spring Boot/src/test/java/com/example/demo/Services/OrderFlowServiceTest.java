package com.example.demo.Services;

import com.example.demo.Entities.*;
import com.example.demo.Repositories.OrderRepository;
import com.example.demo.Repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class OrderFlowServiceTest {

    @Autowired
    private OrderFlowService orderFlowService;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private Order order;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setEmail("flow@example.com");
        user.setUsername("flow");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole("USER");
        userRepository.save(user);

        order = new Order();
        order.setUser(user);
        order.setOrderNumber(UUID.randomUUID().toString());
        order.setDateCreated(new Timestamp(System.currentTimeMillis()));
        order.setStatus(OrderFlowStatus.CREATED.name());
        order.setTotalClientPrice(120.0f);
        order.setDeliveryAddress("Европочта, Минск");
        order = orderRepository.save(order);
    }

    @Test
    void walksEveryTransitionAndBothPayments() {
        Order approved = orderFlowService.approve(order.getId(), "admin");
        assertEquals(OrderFlowStatus.APPROVED.name(), approved.getStatus());

        var purchase = orderFlowService.startPayment(order.getId(), "flow@example.com", PaymentPurpose.PURCHASE, PaymentChannel.MANUAL);
        assertEquals(PaymentPurpose.PURCHASE, purchase.getPurpose());
        assertEquals(120.0, purchase.getAmount());
        assertEquals("CNY", purchase.getCurrency());
        assertEquals(OrderFlowStatus.AWAITING_PURCHASE_PAYMENT.name(), reload().getStatus());

        Order paid = orderFlowService.confirmManualPayment(order.getId(), purchase.getId(), "admin");
        assertEquals(OrderFlowStatus.PURCHASE_PAID.name(), paid.getStatus());

        Order china = orderFlowService.markArrivedInChina(order.getId(), "admin");
        assertEquals(OrderFlowStatus.AT_CHINA_WAREHOUSE.name(), china.getStatus());

        Order weighed = orderFlowService.setWeight(order.getId(), 2.0, "admin");
        assertEquals(OrderFlowStatus.AWAITING_WEIGHT_PAYMENT.name(), weighed.getStatus());
        assertEquals(2.0f, weighed.getWeight());
        double expected = 2.0 * weighed.getShippingRateApplied() + weighed.getIntraMinskFeeApplied();
        assertEquals(expected, weighed.getWeightAmount().doubleValue(), 0.02);

        var weightPay = orderFlowService.startPayment(order.getId(), "flow@example.com", PaymentPurpose.WEIGHT, PaymentChannel.MANUAL);
        assertEquals(PaymentPurpose.WEIGHT, weightPay.getPurpose());
        assertEquals("USD", weightPay.getCurrency());

        Order weightPaid = orderFlowService.confirmManualPayment(order.getId(), weightPay.getId(), "admin");
        assertEquals(OrderFlowStatus.WEIGHT_PAID.name(), weightPaid.getStatus());

        assertEquals(OrderFlowStatus.IN_TRANSIT_TO_MINSK.name(), orderFlowService.markInTransit(order.getId(), "admin").getStatus());
        assertEquals(OrderFlowStatus.READY_FOR_PICKUP.name(), orderFlowService.markReady(order.getId(), "admin").getStatus());
        assertEquals(OrderFlowStatus.COMPLETED.name(), orderFlowService.complete(order.getId(), "admin").getStatus());
    }

    @Test
    void rejectsIllegalTransition() {
        OrderFlowException ex = assertThrows(OrderFlowException.class,
                () -> orderFlowService.complete(order.getId(), "admin"));
        assertTrue(ex.getMessage().contains("Нельзя перевести"));
    }

    @Test
    void rejectAndCancelAreTerminal() {
        Order rejected = orderFlowService.reject(order.getId(), "admin", "нет в наличии");
        assertEquals(OrderFlowStatus.REJECTED.name(), rejected.getStatus());
        assertThrows(OrderFlowException.class, () -> orderFlowService.approve(order.getId(), "admin"));
    }

    @Test
    void customerCanCancelBeforePurchasePayment() {
        orderFlowService.approve(order.getId(), "admin");
        Order cancelled = orderFlowService.cancel(order.getId(), "flow@example.com", null);
        assertEquals(OrderFlowStatus.CANCELLED.name(), cancelled.getStatus());
    }

    @Test
    void gatewayConfirmsPurchaseAndWeight() {
        orderFlowService.approve(order.getId(), "admin");
        orderFlowService.startPayment(order.getId(), "flow@example.com", PaymentPurpose.PURCHASE, PaymentChannel.BEPAID);
        assertTrue(orderFlowService.confirmGatewayPayment(reload()));
        assertEquals(OrderFlowStatus.PURCHASE_PAID.name(), reload().getStatus());

        orderFlowService.markArrivedInChina(order.getId(), "admin");
        orderFlowService.setWeight(order.getId(), 1.5, "admin");
        assertFalse(orderFlowService.confirmGatewayPayment(reload()));
        assertEquals(OrderFlowStatus.WEIGHT_PAID.name(), reload().getStatus());
    }

    @Test
    void weightBeforeChinaWarehouseIsRejected() {
        orderFlowService.approve(order.getId(), "admin");
        assertThrows(OrderFlowException.class, () -> orderFlowService.setWeight(order.getId(), 1, "admin"));
    }

    @Test
    void legacyStatusesMapWithoutLosingTheName() {
        assertEquals("CREATED", OrderFlowService.migrate("PENDING"));
        assertEquals("AWAITING_PURCHASE_PAYMENT", OrderFlowService.migrate("VERIFIED"));
        assertEquals("PURCHASE_PAID", OrderFlowService.migrate("PAID"));
        assertEquals("AT_CHINA_WAREHOUSE", OrderFlowService.migrate("PROCESSED"));
        assertEquals("IN_TRANSIT_TO_MINSK", OrderFlowService.migrate("SHIPPED"));
        assertEquals("READY_FOR_PICKUP", OrderFlowService.migrate("RECEIVED"));
        assertEquals("REJECTED", OrderFlowService.migrate("REFUSED"));
        assertEquals("CANCELLED", OrderFlowService.migrate("REFUNDED"));
        assertEquals("COMPLETED", OrderFlowService.migrate("COMPLETED"));
    }

    private Order reload() {
        return orderRepository.findById(order.getId()).orElseThrow();
    }
}
