package com.example.demo.Entities;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Customer journey for a Fluvion order. See docs/order-flow-plan.md.
 */
public enum OrderFlowStatus {
    CREATED("Создан"),
    APPROVED("Одобрен"),
    REJECTED("Отклонён"),
    AWAITING_PURCHASE_PAYMENT("Ожидает оплату выкупа"),
    PURCHASE_PAID("Выкуп оплачен"),
    AT_CHINA_WAREHOUSE("На складе в Китае"),
    AWAITING_WEIGHT_PAYMENT("Ожидает оплату по весу"),
    WEIGHT_PAID("Доставка оплачена"),
    IN_TRANSIT_TO_MINSK("В пути в Минск"),
    READY_FOR_PICKUP("Готов к выдаче"),
    COMPLETED("Завершён"),
    CANCELLED("Отменён");

    private final String label;

    OrderFlowStatus(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public boolean terminal() {
        return this == REJECTED || this == COMPLETED || this == CANCELLED;
    }

    private static final Map<OrderFlowStatus, Set<OrderFlowStatus>> EDGES = Map.ofEntries(
            Map.entry(CREATED, EnumSet.of(APPROVED, REJECTED, CANCELLED)),
            Map.entry(APPROVED, EnumSet.of(AWAITING_PURCHASE_PAYMENT, CANCELLED)),
            Map.entry(AWAITING_PURCHASE_PAYMENT, EnumSet.of(PURCHASE_PAID, CANCELLED)),
            Map.entry(PURCHASE_PAID, EnumSet.of(AT_CHINA_WAREHOUSE)),
            Map.entry(AT_CHINA_WAREHOUSE, EnumSet.of(AWAITING_WEIGHT_PAYMENT)),
            Map.entry(AWAITING_WEIGHT_PAYMENT, EnumSet.of(WEIGHT_PAID)),
            Map.entry(WEIGHT_PAID, EnumSet.of(IN_TRANSIT_TO_MINSK)),
            Map.entry(IN_TRANSIT_TO_MINSK, EnumSet.of(READY_FOR_PICKUP)),
            Map.entry(READY_FOR_PICKUP, EnumSet.of(COMPLETED)),
            Map.entry(REJECTED, EnumSet.noneOf(OrderFlowStatus.class)),
            Map.entry(COMPLETED, EnumSet.noneOf(OrderFlowStatus.class)),
            Map.entry(CANCELLED, EnumSet.noneOf(OrderFlowStatus.class))
    );

    public boolean canMoveTo(OrderFlowStatus next) {
        return EDGES.getOrDefault(this, Set.of()).contains(next);
    }

    public static OrderFlowStatus parse(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Пустой статус");
        }
        try {
            return OrderFlowStatus.valueOf(raw.trim());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Неизвестный статус заказа: " + raw);
        }
    }
}
