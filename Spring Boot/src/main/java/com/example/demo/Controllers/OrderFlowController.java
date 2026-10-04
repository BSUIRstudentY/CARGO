package com.example.demo.Controllers;

import com.example.demo.Entities.Order;
import com.example.demo.Entities.PaymentChannel;
import com.example.demo.Entities.PaymentPurpose;
import com.example.demo.Repositories.OrderRepository;
import com.example.demo.Services.OrderFlowException;
import com.example.demo.Services.OrderFlowService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderFlowController {

    private final OrderFlowService orderFlowService;
    private final OrderRepository orderRepository;

    public OrderFlowController(OrderFlowService orderFlowService, OrderRepository orderRepository) {
        this.orderFlowService = orderFlowService;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/{id}/timeline")
    public Map<String, Object> timeline(@PathVariable Long id) {
        assertOwner(id);
        return orderFlowService.timeline(id);
    }

    @PostMapping("/{id}/pay")
    public Map<String, Object> pay(@PathVariable Long id, @RequestBody Map<String, String> body) {
        assertOwner(id);
        PaymentPurpose purpose = parsePurpose(body.get("purpose"));
        PaymentChannel method = parseMethod(body.get("method"));
        var payment = orderFlowService.startPayment(id, actor(), purpose, method);
        return Map.of(
                "paymentId", payment.getId(),
                "purpose", payment.getPurpose().name(),
                "method", payment.getMethod().name(),
                "amount", payment.getAmount(),
                "currency", payment.getCurrency(),
                "status", payment.getStatus().name(),
                "orderStatus", orderRepository.findById(id).map(Order::getStatus).orElse("")
        );
    }

    @PostMapping("/{id}/cancel")
    public Map<String, Object> cancel(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        assertOwner(id);
        String reason = body == null ? null : body.get("reason");
        Order order = orderFlowService.cancel(id, actor(), reason);
        return Map.of("id", order.getId(), "status", order.getStatus());
    }

    private void assertOwner(Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new OrderFlowException("Нужно войти в аккаунт");
        }
        boolean admin = auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        Order order = orderRepository.findById(id).orElseThrow(() -> new OrderFlowException("Заказ не найден"));
        if (!admin && (order.getUser() == null || !auth.getName().equals(order.getUser().getEmail()))) {
            throw new OrderFlowException("Этот заказ принадлежит другому клиенту");
        }
    }

    private String actor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth == null ? "customer" : auth.getName();
    }

    private PaymentPurpose parsePurpose(String raw) {
        try {
            return PaymentPurpose.valueOf(raw == null ? "" : raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new OrderFlowException("Укажите назначение платежа: PURCHASE или WEIGHT");
        }
    }

    private PaymentChannel parseMethod(String raw) {
        try {
            return PaymentChannel.valueOf(raw == null ? "" : raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new OrderFlowException("Укажите способ оплаты: MANUAL или BEPAID");
        }
    }
}
