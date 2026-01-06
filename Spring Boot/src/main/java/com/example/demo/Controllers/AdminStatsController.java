package com.example.demo.Controllers;

import com.example.demo.Repositories.OrderRepository;
import com.example.demo.Repositories.UserRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")

public class AdminStatsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/stats")
    public ResponseEntity<AdminStats> getAdminStats() {
        AdminStats stats = new AdminStats();
        stats.setTotalClients(userRepository.count());
        stats.setCurrentOrders(orderRepository.count());
        return ResponseEntity.ok(stats);
    }

    @Data
    public static class AdminStats {
        private long totalClients;
        private long currentOrders;
    }
}