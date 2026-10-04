package com.example.demo.Services;

import com.example.demo.Entities.*;
import com.example.demo.Repositories.AppSettingRepository;
import com.example.demo.Repositories.OrderEventRepository;
import com.example.demo.Repositories.OrderPaymentRepository;
import com.example.demo.Repositories.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class OrderFlowService {

    public static final String INTRA_MINSK_KEY = "intra_minsk_fee_usd";
    public static final double DEFAULT_INTRA_MINSK_USD = 3.0;

    private static final Logger logger = LoggerFactory.getLogger(OrderFlowService.class);

    private final OrderRepository orderRepository;
    private final OrderPaymentRepository paymentRepository;
    private final OrderEventRepository eventRepository;
    private final AppSettingRepository settingRepository;
    private final ExchangeRateService exchangeRateService;
    private final NotificationService notificationService;

    public OrderFlowService(OrderRepository orderRepository,
                            OrderPaymentRepository paymentRepository,
                            OrderEventRepository eventRepository,
                            AppSettingRepository settingRepository,
                            ExchangeRateService exchangeRateService,
                            NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.eventRepository = eventRepository;
        this.settingRepository = settingRepository;
        this.exchangeRateService = exchangeRateService;
        this.notificationService = notificationService;
    }

    @Transactional
    public Order approve(Long orderId, String actor) {
        Order order = load(orderId);
        return transit(order, OrderFlowStatus.APPROVED, actor, "Администратор одобрил заказ");
    }

    @Transactional
    public Order reject(Long orderId, String actor, String reason) {
        Order order = load(orderId);
        if (reason != null && !reason.isBlank()) {
            order.setReasonRefusal(reason.trim());
        }
        String note = reason == null || reason.isBlank()
                ? "Администратор отклонил заказ"
                : "Администратор отклонил заказ: " + reason.trim();
        return transit(order, OrderFlowStatus.REJECTED, actor, note);
    }

    @Transactional
    public Order cancel(Long orderId, String actor, String reason) {
        Order order = load(orderId);
        String note = reason == null || reason.isBlank() ? "Заказ отменён" : "Заказ отменён: " + reason.trim();
        return transit(order, OrderFlowStatus.CANCELLED, actor, note);
    }

    @Transactional
    public Order markArrivedInChina(Long orderId, String actor) {
        Order order = load(orderId);
        return transit(order, OrderFlowStatus.AT_CHINA_WAREHOUSE, actor, "Груз прибыл на склад в Китае");
    }

    @Transactional
    public Order setWeight(Long orderId, double weightKg, String actor) {
        if (weightKg <= 0) {
            throw new OrderFlowException("Укажите вес больше нуля");
        }
        Order order = load(orderId);
        require(order, OrderFlowStatus.AT_CHINA_WAREHOUSE);
        double rate = exchangeRateService.getCurrentShippingRate();
        double intra = intraMinskFee();
        double amount = round2(weightKg * rate + intra);
        order.setWeight((float) weightKg);
        order.setChargeableWeight((float) weightKg);
        order.setShippingRateApplied(rate);
        order.setIntraMinskFeeApplied(intra);
        order.setWeightAmount((float) amount);
        order.setWeightCurrency("USD");
        String note = String.format(Locale.US,
                "Вес %.3f кг. Доставка до Минска %.2f USD и по Минску %.2f USD, итого %.2f USD",
                weightKg, weightKg * rate, intra, amount);
        return transit(order, OrderFlowStatus.AWAITING_WEIGHT_PAYMENT, actor, note);
    }

    @Transactional
    public Order markInTransit(Long orderId, String actor) {
        return transit(load(orderId), OrderFlowStatus.IN_TRANSIT_TO_MINSK, actor, "Груз отправлен в Минск");
    }

    @Transactional
    public Order markReady(Long orderId, String actor) {
        return transit(load(orderId), OrderFlowStatus.READY_FOR_PICKUP, actor, "Заказ готов к выдаче в отделении Европочты");
    }

    @Transactional
    public Order complete(Long orderId, String actor) {
        return transit(load(orderId), OrderFlowStatus.COMPLETED, actor, "Заказ получен");
    }

    @Transactional
    public OrderPayment startPayment(Long orderId, String actor, PaymentPurpose purpose, PaymentChannel method) {
        Order order = load(orderId);
        OrderFlowStatus status = current(order);
        double amount;
        String currency;
        if (purpose == PaymentPurpose.PURCHASE) {
            if (status != OrderFlowStatus.APPROVED && status != OrderFlowStatus.AWAITING_PURCHASE_PAYMENT) {
                throw new OrderFlowException("Оплатить выкуп можно после одобрения заказа");
            }
            if (status == OrderFlowStatus.APPROVED) {
                transit(order, OrderFlowStatus.AWAITING_PURCHASE_PAYMENT, actor, "Выбран способ оплаты выкупа");
            }
            if (order.getTotalClientPrice() == null || order.getTotalClientPrice() <= 0) {
                throw new OrderFlowException("У заказа нет суммы выкупа");
            }
            amount = order.getTotalClientPrice().doubleValue();
            currency = "CNY";
        } else {
            if (status != OrderFlowStatus.AWAITING_WEIGHT_PAYMENT) {
                throw new OrderFlowException("Оплатить доставку можно после расчёта по весу");
            }
            if (order.getWeightAmount() == null || order.getWeightAmount() <= 0) {
                throw new OrderFlowException("Сумма доставки ещё не рассчитана");
            }
            amount = order.getWeightAmount().doubleValue();
            currency = order.getWeightCurrency() == null ? "USD" : order.getWeightCurrency();
        }

        Optional<OrderPayment> existing = paymentRepository
                .findFirstByOrderIdAndPurposeAndStatusOrderByCreatedAtDesc(orderId, purpose, PaymentState.PENDING);
        if (existing.isPresent() && existing.get().getMethod() == method) {
            return existing.get();
        }

        OrderPayment payment = new OrderPayment();
        payment.setOrder(order);
        payment.setPurpose(purpose);
        payment.setMethod(method);
        payment.setAmount(round2(amount));
        payment.setCurrency(currency);
        payment.setStatus(PaymentState.PENDING);
        payment.setCreatedAt(LocalDateTime.now());
        return paymentRepository.save(payment);
    }

    @Transactional
    public Order confirmManualPayment(Long orderId, Long paymentId, String actor) {
        Order order = load(orderId);
        OrderPayment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new OrderFlowException("Платёж не найден"));
        if (!payment.getOrder().getId().equals(orderId)) {
            throw new OrderFlowException("Платёж не относится к этому заказу");
        }
        if (payment.getMethod() != PaymentChannel.MANUAL) {
            throw new OrderFlowException("Этот платёж подтверждает платёжная система");
        }
        if (payment.getStatus() == PaymentState.PAID) {
            throw new OrderFlowException("Платёж уже подтверждён");
        }
        settle(payment, actor);
        advanceAfterPayment(order, payment.getPurpose(), actor,
                payment.getPurpose() == PaymentPurpose.PURCHASE
                        ? "Оплата выкупа подтверждена"
                        : "Оплата доставки подтверждена");
        return orderRepository.findById(orderId).orElse(order);
    }

    /**
     * bePaid webhook or status check. Returns true when the purchase payment just succeeded.
     */
    @Transactional
    public boolean confirmGatewayPayment(Order order) {
        if (order == null || order.getId() == null) {
            return false;
        }
        Order managed = orderRepository.findById(order.getId()).orElse(order);
        OrderFlowStatus status;
        try {
            status = current(managed);
        } catch (OrderFlowException ex) {
            return false;
        }
        if (status == OrderFlowStatus.APPROVED) {
            transit(managed, OrderFlowStatus.AWAITING_PURCHASE_PAYMENT, "bepaid", "Оплата выкупа через bePaid");
            status = OrderFlowStatus.AWAITING_PURCHASE_PAYMENT;
        }
        if (status == OrderFlowStatus.AWAITING_PURCHASE_PAYMENT) {
            markChannelPaid(managed, PaymentPurpose.PURCHASE, PaymentChannel.BEPAID);
            advanceAfterPayment(managed, PaymentPurpose.PURCHASE, "bepaid", "Оплата выкупа через bePaid");
            return true;
        }
        if (status == OrderFlowStatus.AWAITING_WEIGHT_PAYMENT) {
            markChannelPaid(managed, PaymentPurpose.WEIGHT, PaymentChannel.BEPAID);
            advanceAfterPayment(managed, PaymentPurpose.WEIGHT, "bepaid", "Оплата доставки через bePaid");
        }
        return false;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> timeline(Long orderId) {
        Order order = load(orderId);
        OrderFlowStatus status;
        try {
            status = current(order);
        } catch (OrderFlowException ex) {
            status = null;
        }
        int currentIndex = stepIndex(status);
        List<Map<String, Object>> steps = new ArrayList<>();
        String[] titles = {
                "Заказ",
                "Решение",
                "Оплата выкупа",
                "Склад в Китае",
                "Оплата по весу",
                "В пути в Минск",
                "Получение"
        };
        for (int i = 0; i < titles.length; i++) {
            Map<String, Object> step = new LinkedHashMap<>();
            step.put("index", i);
            step.put("title", titles[i]);
            step.put("state", currentIndex < 0 ? "upcoming" : (i < currentIndex ? "done" : (i == currentIndex ? "current" : "upcoming")));
            steps.add(step);
        }
        if (status == OrderFlowStatus.COMPLETED) {
            steps.forEach(step -> step.put("state", "done"));
            steps.get(steps.size() - 1).put("state", "current");
        }
        if (status == OrderFlowStatus.REJECTED) {
            steps.get(1).put("state", "current");
            steps.get(1).put("title", "Отклонён");
        }

        List<Map<String, Object>> events = eventRepository.findByOrderIdOrderByCreatedAtAsc(order.getId()).stream()
                .map(event -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("from", event.getFromStatus());
                    row.put("to", event.getToStatus());
                    row.put("actor", event.getActor());
                    row.put("message", event.getMessage());
                    row.put("at", event.getCreatedAt() == null ? null : event.getCreatedAt().toString());
                    return row;
                }).toList();

        List<Map<String, Object>> payments = paymentRepository.findByOrderIdOrderByCreatedAtAsc(order.getId()).stream()
                .map(this::paymentView).toList();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("orderId", order.getId());
        body.put("orderNumber", order.getOrderNumber());
        body.put("status", order.getStatus());
        body.put("statusLabel", status == null ? order.getStatus() : status.label());
        body.put("legacyStatus", order.getLegacyStatus());
        body.put("deliveryAddress", order.getDeliveryAddress());
        body.put("totalClientPrice", order.getTotalClientPrice());
        body.put("purchaseCurrency", "CNY");
        body.put("weightKg", order.getWeight());
        body.put("weightAmount", order.getWeightAmount());
        body.put("weightCurrency", order.getWeightCurrency());
        body.put("shippingRateUsdPerKg", order.getShippingRateApplied() != null
                ? order.getShippingRateApplied() : exchangeRateService.getCurrentShippingRate());
        body.put("intraMinskFeeUsd", order.getIntraMinskFeeApplied() != null
                ? order.getIntraMinskFeeApplied() : intraMinskFee());
        body.put("reasonRefusal", order.getReasonRefusal());
        body.put("steps", steps);
        body.put("events", events);
        body.put("payments", payments);
        body.put("methods", List.of("MANUAL", "BEPAID"));
        return body;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> board() {
        List<Order> orders = orderRepository.findAll();
        orders.sort(Comparator.comparing(Order::getDateCreated, Comparator.nullsLast(Comparator.reverseOrder())));
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Order order : orders) {
            Map<String, Object> row = new LinkedHashMap<>();
            OrderFlowStatus status = null;
            try {
                status = current(order);
            } catch (OrderFlowException ignored) {
                // legacy value that has not been migrated yet
            }
            row.put("id", order.getId());
            row.put("orderNumber", order.getOrderNumber());
            row.put("status", order.getStatus());
            row.put("statusLabel", status == null ? order.getStatus() : status.label());
            row.put("email", order.getUser() == null ? null : order.getUser().getEmail());
            row.put("totalClientPrice", order.getTotalClientPrice());
            row.put("weightKg", order.getWeight());
            row.put("weightAmount", order.getWeightAmount());
            row.put("deliveryAddress", order.getDeliveryAddress());
            row.put("actions", actionsFor(status));
            rows.add(row);
        }
        return rows;
    }

    public double intraMinskFee() {
        return settingRepository.findById(INTRA_MINSK_KEY)
                .map(setting -> {
                    try {
                        return Double.parseDouble(setting.getValue());
                    } catch (NumberFormatException ex) {
                        return DEFAULT_INTRA_MINSK_USD;
                    }
                })
                .orElse(DEFAULT_INTRA_MINSK_USD);
    }

    @Transactional
    public double updateIntraMinskFee(double amountUsd) {
        if (amountUsd < 0) {
            throw new OrderFlowException("Сбор по Минску не может быть отрицательным");
        }
        AppSetting setting = settingRepository.findById(INTRA_MINSK_KEY).orElseGet(AppSetting::new);
        setting.setKey(INTRA_MINSK_KEY);
        setting.setValue(Double.toString(round2(amountUsd)));
        settingRepository.save(setting);
        return round2(amountUsd);
    }

    public static String migrate(String legacy) {
        if (legacy == null || legacy.isBlank()) {
            return OrderFlowStatus.CREATED.name();
        }
        String value = legacy.trim().toUpperCase(Locale.ROOT);
        try {
            OrderFlowStatus.parse(value);
            return value;
        } catch (IllegalArgumentException ignored) {
            // old vocabulary
        }
        return switch (value) {
            case "PENDING", "NEW", "PROCESSING" -> OrderFlowStatus.CREATED.name();
            case "VERIFIED" -> OrderFlowStatus.AWAITING_PURCHASE_PAYMENT.name();
            case "PAID" -> OrderFlowStatus.PURCHASE_PAID.name();
            case "PROCESSED" -> OrderFlowStatus.AT_CHINA_WAREHOUSE.name();
            case "SHIPPED", "IN_TRANSIT" -> OrderFlowStatus.IN_TRANSIT_TO_MINSK.name();
            case "RECEIVED", "ARRIVED" -> OrderFlowStatus.READY_FOR_PICKUP.name();
            case "COMPLETED", "DELIVERED" -> OrderFlowStatus.COMPLETED.name();
            case "REFUSED" -> OrderFlowStatus.REJECTED.name();
            case "CANCELLED", "REFUNDED" -> OrderFlowStatus.CANCELLED.name();
            default -> OrderFlowStatus.CREATED.name();
        };
    }

    private void advanceAfterPayment(Order order, PaymentPurpose purpose, String actor, String note) {
        OrderFlowStatus next = purpose == PaymentPurpose.PURCHASE
                ? OrderFlowStatus.PURCHASE_PAID
                : OrderFlowStatus.WEIGHT_PAID;
        Order fresh = orderRepository.findById(order.getId()).orElse(order);
        if (current(fresh) == next) {
            return;
        }
        transit(fresh, next, actor, note);
    }

    private void markChannelPaid(Order order, PaymentPurpose purpose, PaymentChannel channel) {
        OrderPayment payment = paymentRepository
                .findFirstByOrderIdAndPurposeAndStatusOrderByCreatedAtDesc(order.getId(), purpose, PaymentState.PENDING)
                .orElseGet(() -> {
                    OrderPayment created = new OrderPayment();
                    created.setOrder(order);
                    created.setPurpose(purpose);
                    created.setMethod(channel);
                    created.setCurrency(purpose == PaymentPurpose.PURCHASE ? "CNY" : "USD");
                    double amount = purpose == PaymentPurpose.PURCHASE
                            ? (order.getTotalClientPrice() == null ? 0 : order.getTotalClientPrice())
                            : (order.getWeightAmount() == null ? 0 : order.getWeightAmount());
                    created.setAmount(amount);
                    created.setCreatedAt(LocalDateTime.now());
                    created.setStatus(PaymentState.PENDING);
                    return created;
                });
        payment.setMethod(channel);
        settle(payment, "bepaid");
    }

    private void settle(OrderPayment payment, String actor) {
        payment.setStatus(PaymentState.PAID);
        payment.setPaidAt(LocalDateTime.now());
        if (payment.getExternalId() == null) {
            payment.setExternalId(actor);
        }
        paymentRepository.save(payment);
    }

    private Order transit(Order order, OrderFlowStatus next, String actor, String message) {
        OrderFlowStatus from = current(order);
        if (!from.canMoveTo(next)) {
            throw new OrderFlowException("Нельзя перевести заказ из «" + from.label() + "» в «" + next.label() + "»");
        }
        order.setStatus(next.name());
        Order saved = orderRepository.save(order);
        OrderEvent event = new OrderEvent();
        event.setOrder(saved);
        event.setFromStatus(from.name());
        event.setToStatus(next.name());
        event.setActor(actor == null ? "system" : actor);
        event.setMessage(message);
        event.setCreatedAt(LocalDateTime.now());
        eventRepository.save(event);
        notify(saved, next);
        return saved;
    }

    private void notify(Order order, OrderFlowStatus status) {
        if (order.getUser() == null) {
            return;
        }
        try {
            notificationService.sendOrderStatusChangeNotification(
                    order.getUser(), order.getId(), status.label());
        } catch (Exception ex) {
            logger.warn("Не удалось отправить уведомление по заказу {}: {}", order.getId(), ex.getMessage());
        }
    }

    private Order load(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new OrderFlowException("Заказ не найден"));
    }

    private OrderFlowStatus current(Order order) {
        try {
            return OrderFlowStatus.parse(order.getStatus());
        } catch (IllegalArgumentException ex) {
            throw new OrderFlowException(ex.getMessage());
        }
    }

    private void require(Order order, OrderFlowStatus expected) {
        OrderFlowStatus status = current(order);
        if (status != expected) {
            throw new OrderFlowException("Сейчас заказ в статусе «" + status.label() + "», ожидался «" + expected.label() + "»");
        }
    }

    private Map<String, Object> paymentView(OrderPayment payment) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", payment.getId());
        row.put("purpose", payment.getPurpose().name());
        row.put("method", payment.getMethod().name());
        row.put("amount", payment.getAmount());
        row.put("currency", payment.getCurrency());
        row.put("status", payment.getStatus().name());
        return row;
    }

    private List<String> actionsFor(OrderFlowStatus status) {
        if (status == null) {
            return List.of();
        }
        return switch (status) {
            case CREATED -> List.of("approve", "reject", "cancel");
            case APPROVED, AWAITING_PURCHASE_PAYMENT -> List.of("confirm-payment", "cancel");
            case PURCHASE_PAID -> List.of("arrived-china");
            case AT_CHINA_WAREHOUSE -> List.of("weight");
            case AWAITING_WEIGHT_PAYMENT -> List.of("confirm-payment");
            case WEIGHT_PAID -> List.of("in-transit");
            case IN_TRANSIT_TO_MINSK -> List.of("ready");
            case READY_FOR_PICKUP -> List.of("complete");
            default -> List.of();
        };
    }

    private static int stepIndex(OrderFlowStatus status) {
        if (status == null) {
            return 0;
        }
        return switch (status) {
            case CREATED -> 0;
            case APPROVED, REJECTED -> 1;
            case AWAITING_PURCHASE_PAYMENT -> 2;
            case PURCHASE_PAID, AT_CHINA_WAREHOUSE -> 3;
            case AWAITING_WEIGHT_PAYMENT -> 4;
            case WEIGHT_PAID, IN_TRANSIT_TO_MINSK -> 5;
            case READY_FOR_PICKUP, COMPLETED -> 6;
            case CANCELLED -> 0;
        };
    }

    private static double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
