package com.example.demo.Config;

import com.example.demo.Entities.AppSetting;
import com.example.demo.Entities.Order;
import com.example.demo.Entities.OrderFlowStatus;
import com.example.demo.Repositories.AppSettingRepository;
import com.example.demo.Repositories.OrderRepository;
import com.example.demo.Services.OrderFlowService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Rewrites legacy order statuses onto the new lifecycle and keeps the old value.
 */
@Component
public class OrderStatusMigration implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(OrderStatusMigration.class);

    private final OrderRepository orderRepository;
    private final AppSettingRepository settingRepository;

    public OrderStatusMigration(OrderRepository orderRepository, AppSettingRepository settingRepository) {
        this.orderRepository = orderRepository;
        this.settingRepository = settingRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        int moved = 0;
        for (Order order : orderRepository.findAll()) {
            String current = order.getStatus();
            String mapped = OrderFlowService.migrate(current);
            if ("PROCESSED".equalsIgnoreCase(current) && order.getWeight() != null && order.getWeight() > 0) {
                mapped = OrderFlowStatus.AWAITING_WEIGHT_PAYMENT.name();
            }
            if (current != null && current.equals(mapped)) {
                continue;
            }
            if (order.getLegacyStatus() == null) {
                order.setLegacyStatus(current);
            }
            order.setStatus(mapped);
            orderRepository.save(order);
            moved++;
        }
        if (moved > 0) {
            logger.info("Migrated {} orders onto the new lifecycle", moved);
        }
        if (settingRepository.findById(OrderFlowService.INTRA_MINSK_KEY).isEmpty()) {
            AppSetting setting = new AppSetting();
            setting.setKey(OrderFlowService.INTRA_MINSK_KEY);
            setting.setValue(Double.toString(OrderFlowService.DEFAULT_INTRA_MINSK_USD));
            settingRepository.save(setting);
        }
    }
}
