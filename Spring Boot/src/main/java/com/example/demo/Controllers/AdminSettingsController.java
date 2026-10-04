package com.example.demo.Controllers;

import com.example.demo.Services.OrderFlowService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
public class AdminSettingsController {

    private final OrderFlowService orderFlowService;

    public AdminSettingsController(OrderFlowService orderFlowService) {
        this.orderFlowService = orderFlowService;
    }

    @GetMapping("/intra-minsk-fee")
    public Map<String, Object> fee() {
        return Map.of("amountUsd", orderFlowService.intraMinskFee());
    }

    @PutMapping("/intra-minsk-fee")
    public Map<String, Object> update(@RequestBody Map<String, Object> body) {
        Object raw = body.get("amountUsd");
        double amount = raw == null ? 0 : Double.parseDouble(raw.toString());
        return Map.of("amountUsd", orderFlowService.updateIntraMinskFee(amount));
    }
}
