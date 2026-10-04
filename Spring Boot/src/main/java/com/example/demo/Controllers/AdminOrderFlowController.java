package com.example.demo.Controllers;

import com.example.demo.Entities.Order;
import com.example.demo.Services.OrderFlowService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderFlowController {

    private final OrderFlowService orderFlowService;

    public AdminOrderFlowController(OrderFlowService orderFlowService) {
        this.orderFlowService = orderFlowService;
    }

    @GetMapping("/board")
    public List<Map<String, Object>> board() {
        return orderFlowService.board();
    }

    @PostMapping("/{id}/approve")
    public Map<String, Object> approve(@PathVariable Long id) {
        return view(orderFlowService.approve(id, actor()));
    }

    @PostMapping("/{id}/reject")
    public Map<String, Object> reject(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String reason = body == null ? null : body.get("reason");
        return view(orderFlowService.reject(id, actor(), reason));
    }

    @PostMapping("/{id}/cancel")
    public Map<String, Object> cancel(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String reason = body == null ? null : body.get("reason");
        return view(orderFlowService.cancel(id, actor(), reason));
    }

    @PostMapping("/{id}/arrived-china")
    public Map<String, Object> arrived(@PathVariable Long id) {
        return view(orderFlowService.markArrivedInChina(id, actor()));
    }

    @PostMapping("/{id}/weight")
    public Map<String, Object> weight(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Object raw = body.get("weightKg");
        if (raw == null) {
            raw = body.get("weight");
        }
        double kg = raw == null ? 0 : Double.parseDouble(raw.toString());
        return view(orderFlowService.setWeight(id, kg, actor()));
    }

    @PostMapping("/{id}/in-transit")
    public Map<String, Object> transit(@PathVariable Long id) {
        return view(orderFlowService.markInTransit(id, actor()));
    }

    @PostMapping("/{id}/ready")
    public Map<String, Object> ready(@PathVariable Long id) {
        return view(orderFlowService.markReady(id, actor()));
    }

    @PostMapping("/{id}/complete")
    public Map<String, Object> complete(@PathVariable Long id) {
        return view(orderFlowService.complete(id, actor()));
    }

    @PostMapping("/{id}/payments/{paymentId}/confirm")
    public Map<String, Object> confirm(@PathVariable Long id, @PathVariable Long paymentId) {
        return view(orderFlowService.confirmManualPayment(id, paymentId, actor()));
    }

    private Map<String, Object> view(Order order) {
        return Map.of(
                "id", order.getId(),
                "status", order.getStatus(),
                "weightKg", order.getWeight() == null ? 0 : order.getWeight(),
                "weightAmount", order.getWeightAmount() == null ? 0 : order.getWeightAmount()
        );
    }

    private String actor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth == null ? "admin" : auth.getName();
    }
}
