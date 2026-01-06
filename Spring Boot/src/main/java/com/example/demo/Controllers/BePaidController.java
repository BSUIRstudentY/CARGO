package com.example.demo.Controllers;

import com.example.demo.Entities.Order;
import com.example.demo.Entities.Transaction;
import com.example.demo.Entities.User;
import com.example.demo.Repositories.OrderRepository;
import com.example.demo.Repositories.TransactionRepository;
import com.example.demo.Repositories.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
public class BePaidController {
    private static final Logger logger = LoggerFactory.getLogger(BePaidController.class);

    private final RestTemplate restTemplate;
    private final TransactionRepository transactionRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${bepaid.shop-id}")
    private String shopId;

    @Value("${bepaid.secret-key}")
    private String secretKey;

    // Endpoint для создания платежа через checkout (для редиректа на форму оплаты)
    @Value("${bepaid.checkout-url:https://checkout.bepaid.by/ctp/api/checkouts}")
    private String checkoutUrl;
    
    // Endpoint для альтернативных способов оплаты (если понадобится)
    @Value("${bepaid.payment-url:https://api.bepaid.by/beyag/transactions/payments}")
    private String paymentUrl;

    @Value("${bepaid.return-url:https://fluvion.by/thanks}")
    private String returnUrl;

    @Value("${bepaid.fail-url:https://fluvion.by/badResponse}")
    private String failUrl;

    @Value("${bepaid.callback-url:https://fluvion.by/api/payment/webhook}")
    private String callbackUrl;

    @Value("${bepaid.notification-url:}")
    private String notificationUrl;

    @Value("${bepaid.test-mode:true}")
    private boolean testMode;

    @Autowired
    public BePaidController(RestTemplate restTemplate,
                                TransactionRepository transactionRepository,
                                OrderRepository orderRepository,
                                UserRepository userRepository) {
        this.restTemplate = restTemplate;
        this.transactionRepository = transactionRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    // Создание платежа через payments API
    @Transactional
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createPayment(@Valid @RequestBody PaymentRequest request) {
        // Validate request
        if (request.getOrderId() == null) {
            logger.warn("Payment creation failed: orderId is null");
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Order ID is required"));
        }
        
        Optional<Order> optOrder = orderRepository.findById(request.getOrderId());
        if (optOrder.isEmpty()) {
            logger.warn("Payment creation failed: order {} not found", request.getOrderId());
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Заказ не найден"));
        }
        
        Order order = optOrder.get();
        if (!"VERIFIED".equals(order.getStatus())) {
            logger.warn("Payment creation failed: order {} is not verified (status: {})", 
                    request.getOrderId(), order.getStatus());
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Заказ не подтверждён"));
        }

        Double amountCNY = request.getAmount(); // Сумма в юанях (CNY)
        if (amountCNY == null || amountCNY <= 0) {
            logger.warn("Payment creation failed: invalid amount {} for order {}", amountCNY, request.getOrderId());
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Неверная сумма"));
        }

        // Конвертируем CNY в BYN (курс 0.45)
        double CNY_TO_BYN_RATE = 0.45;
        Double amountBYN = amountCNY * CNY_TO_BYN_RATE;
        
        logger.info("Payment amount conversion: {} CNY -> {} BYN (rate: {}) for order {}", 
                amountCNY, amountBYN, CNY_TO_BYN_RATE, request.getOrderId());

        // Проверяем, нужно ли вообще оплачивать (если оплата с баланса, возможно доплата = 0)
        if (amountBYN <= 0) {
            logger.info("Payment amount is 0 for order {}, marking as PAID", request.getOrderId());
            order.setStatus("PAID");
            orderRepository.save(order);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "status", "PAID",
                    "message", "Заказ уже оплачен"
            ));
        }

        // Создаём транзакцию
        Transaction transaction = new Transaction();
        transaction.setOrder(order);
        transaction.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(transaction); // ← генерируется ID

        // УНИКАЛЬНЫЙ tracking_id = transaction.id
        String trackingId = String.valueOf(transaction.getId());

        // Подготовка данных для bePaid checkout API
        Map<String, Object> checkout = new HashMap<>();
        checkout.put("test", testMode);
        checkout.put("transaction_type", "payment");

        // Данные заказа
        Map<String, Object> orderMap = new HashMap<>();
        // amount должен быть в минимальных единицах (копейки для BYN) и целым числом (long)
        // Используем amountBYN (уже сконвертированную сумму в BYN)
        long amountInCents = Math.round(amountBYN * 100);
        if (amountInCents < 1) {
            logger.warn("Invalid amount {} BYN ({} CNY) for order {}", amountBYN, amountCNY, request.getOrderId());
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Сумма должна быть больше 0"));
        }
        orderMap.put("amount", amountInCents); // amount в минимальных единицах (копейки для BYN)
        orderMap.put("currency", "BYN");
        orderMap.put("description", "Оплата заказа #" + order.getOrderNumber());
        orderMap.put("tracking_id", trackingId); // ← УНИКАЛЬНЫЙ!
        checkout.put("order", orderMap);
        
        logger.debug("Checkout order amount: {} CNY -> {} BYN = {} копеек", amountCNY, amountBYN, amountInCents);

        // Настройки редиректа и уведомлений
        Map<String, Object> settings = new HashMap<>();
        
        // bePaid НЕ принимает localhost URLs! Используйте реальный домен или ngrok для тестирования
        // При успешной оплате → /thanks, при ошибке/отказе → /badResponse
        String finalReturnUrl = returnUrl + "?status=success&order=" + order.getId();
        String finalDeclineUrl = failUrl + "?order=" + order.getId(); // decline тоже ведет на badResponse
        String finalFailUrl = failUrl + "?order=" + order.getId();
        
        // Проверка на localhost
        if (finalReturnUrl.contains("localhost") || finalReturnUrl.contains("127.0.0.1")) {
            logger.warn("WARNING: Return URL contains localhost! bePaid may reject it. Use ngrok or real domain for testing.");
        }
        
        settings.put("success_url", finalReturnUrl);
        settings.put("decline_url", finalDeclineUrl);
        settings.put("fail_url", finalFailUrl);
        
        // Notification URL для webhook уведомлений
        // ВАЖНО: bePaid не может отправить webhook на localhost! Используйте ngrok или реальный домен
        String finalNotificationUrl = null;
        if (notificationUrl != null && !notificationUrl.isEmpty()) {
            finalNotificationUrl = notificationUrl;
        } else if (callbackUrl != null && !callbackUrl.isEmpty()) {
            finalNotificationUrl = callbackUrl;
        }
        
        if (finalNotificationUrl != null) {
            if (finalNotificationUrl.contains("localhost") || finalNotificationUrl.contains("127.0.0.1")) {
                logger.warn("WARNING: Notification URL contains localhost! bePaid cannot send webhooks to localhost. " +
                        "Use ngrok (https://ngrok.com) to create a tunnel or use a real domain.");
            } else {
                settings.put("notification_url", finalNotificationUrl);
            }
        }
        
        settings.put("language", "ru");
        checkout.put("settings", settings);

        // Данные покупателя (может быть обязательным)
        User user = order.getUser();
        if (user != null) {
            Map<String, Object> customer = new HashMap<>();
            customer.put("email", user.getEmail());
            if (user.getPhone() != null && !user.getPhone().isEmpty()) {
                customer.put("phone", user.getPhone());
            }
            checkout.put("customer", customer);
        }

        // Обёртываем в корневой объект checkout
        Map<String, Object> root = new HashMap<>();
        root.put("checkout", checkout);
        
        logger.debug("Creating checkout for order {} with tracking_id: {}, amount: {} BYN ({} CNY -> {} копеек)", 
                request.getOrderId(), trackingId, amountBYN, amountCNY, amountInCents);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBasicAuth(shopId, secretKey);
        headers.set("Accept", "application/json");

        try {
            // Логируем финальный запрос для отладки
            String requestJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(root);
            logger.info("Sending checkout request to bePaid for order {}: {}", request.getOrderId(), requestJson);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    checkoutUrl, new HttpEntity<>(root, headers), Map.class);

            Map<String, Object> body = response.getBody();
            if (body == null || !body.containsKey("checkout")) {
                logger.error("Invalid response from bePaid: {}", body);
                return ResponseEntity.status(502)
                        .body(Map.of("success", false, "error", "Ошибка bePaid: неверный ответ"));
            }

            Map<String, Object> checkoutResp = (Map<String, Object>) body.get("checkout");
            String redirectUrl = (String) checkoutResp.get("redirect_url");
            String token = (String) checkoutResp.get("token"); // Токен checkout для проверки статуса

            if (redirectUrl == null || redirectUrl.trim().isEmpty()) {
                logger.error("bePaid checkout created but no redirect_url provided for order {}", request.getOrderId());
                return ResponseEntity.status(502)
                        .body(Map.of("success", false, "error", "Ошибка bePaid: отсутствует redirect_url"));
            }

            logger.info("Checkout created successfully for order {}: redirect_url={}, token={}, amount={} BYN ({} CNY -> {} копеек)", 
                    request.getOrderId(), redirectUrl, token, amountBYN, amountCNY, amountInCents);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "status", "pending",
                    "formUrl", redirectUrl,
                    "token", token != null ? token : "",
                    "tracking_id", trackingId,
                    "message", "Перенаправление на форму оплаты"
            ));

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            // Обработка ошибок от bePaid
            String errorBody = e.getResponseBodyAsString();
            logger.error("bePaid error for order {}: Status={}, Body={}", 
                    request.getOrderId(), e.getStatusCode(), errorBody);
            
            String errorMessage = "Ошибка создания платежа";
            try {
                if (errorBody != null && !errorBody.trim().isEmpty()) {
                    JsonNode errorNode = objectMapper.readTree(errorBody);
                    
                    // Проверяем различные форматы ошибок
                    if (errorNode.has("friendly_message")) {
                        errorMessage = errorNode.get("friendly_message").asText();
                    } else if (errorNode.has("message")) {
                        errorMessage = errorNode.get("message").asText();
                    } else if (errorNode.has("checkout")) {
                        JsonNode checkoutNode = errorNode.path("checkout");
                        if (checkoutNode.has("message")) {
                            errorMessage = checkoutNode.get("message").asText();
                        }
                    }
                }
            } catch (Exception parseEx) {
                logger.debug("Could not parse error response: {}", parseEx.getMessage());
            }
            
            return ResponseEntity.status(e.getStatusCode().value())
                    .body(Map.of("success", false, "error", errorMessage));
        } catch (Exception e) {
            logger.error("Error creating checkout for order {}: {}", request.getOrderId(), e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(Map.of("success", false, "error", "Ошибка инициализации платежа: " + e.getMessage()));
        }
    }

    // Обработка успешного платежа: обновление статуса и обновление потраченных средств
    @Transactional
    private void processSuccessfulPayment(Order order) {
        if (!"PAID".equals(order.getStatus())) {
            order.setStatus("PAID");
            orderRepository.save(order);
            logger.info("Order {} marked as PAID", order.getId());

            // Обновляем потраченные средства пользователя
            User user = order.getUser();
            if (user != null && order.getTotalClientPrice() != null) {
                // Добавляем общую сумму заказа к потраченным средствам
                double currentMoneySpent = user.getMoneySpent() != null ? user.getMoneySpent() : 0.0;
                double orderTotal = order.getTotalClientPrice().doubleValue();
                user.setMoneySpent(currentMoneySpent + orderTotal);
                
                userRepository.save(user);
                logger.info("Updated moneySpent for user {}: added {} CNY (total: {} CNY)", 
                    user.getEmail(), orderTotal, user.getMoneySpent());
            }
        }
    }

    // Webhook — находит транзакцию по tracking_id → получает заказ → обновляет статус заказа
    @PostMapping("/webhook")
    @Transactional
    public ResponseEntity<String> handleWebhook(HttpServletRequest httpRequest,
                                                @RequestBody String rawBody) {
        // Проверка подписи — ОБЯЗАТЕЛЬНО!
        String signature = httpRequest.getHeader("X-API-Signature");
        if (signature == null || signature.trim().isEmpty()) {
            logger.warn("Webhook received without signature header");
            return ResponseEntity.status(400).body("Missing signature");
        }
        
        if (!verifySignature(rawBody, signature)) {
            logger.warn("Webhook signature verification failed");
            return ResponseEntity.status(400).body("Invalid signature");
        }

        try {
            JsonNode root = objectMapper.readTree(rawBody);
            
            // bePaid может отправлять webhook в разных форматах
            // Проверяем наличие transaction в корне или в обертке
            JsonNode txNode = null;
            if (root.has("transaction")) {
                txNode = root.path("transaction");
            } else if (root.has("status") || root.has("tracking_id")) {
                // Транзакция в корне
                txNode = root;
            }
            
            if (txNode == null) {
                logger.warn("Webhook received but no transaction data found: {}", rawBody);
                return ResponseEntity.ok("OK");
            }
            
            String status = txNode.path("status").asText();
            String trackingId = txNode.path("tracking_id").asText(); // ← это transaction.id
            String uid = txNode.has("uid") ? txNode.path("uid").asText() : null;

            logger.info("Webhook received - status: {}, tracking_id: {}, uid: {}", status, trackingId, uid);

            Long transactionId = Long.valueOf(trackingId);
            Optional<Transaction> optTx = transactionRepository.findById(transactionId);
            if (optTx.isEmpty()) {
                logger.warn("Transaction {} not found for webhook, ignoring", transactionId);
                return ResponseEntity.ok("OK"); // не наша транзакция
            }

            Transaction transaction = optTx.get();
            Order order = transaction.getOrder();

            // Обновляем статус ЗАКАЗА согласно алгоритму из документации
            // Согласно документации: "В тот момент, когда статус платежа принимает окончательное значение, 
            // на переданный в запросе notification_url делается обратный вызов"
            if ("successful".equals(status) || (txNode.has("code") && txNode.path("code").asText().startsWith("S."))) {
                processSuccessfulPayment(order);
                logger.info("Order {} marked as PAID via webhook (uid: {})", order.getId(), uid);
            } else if ("failed".equals(status) || "declined".equals(status) || 
                      (txNode.has("code") && txNode.path("code").asText().startsWith("F."))) {
                logger.warn("Order {} payment failed via webhook (uid: {})", order.getId(), uid);
                // Можно добавить логику обработки неудачного платежа
            } else {
                logger.debug("Webhook received status '{}' for transaction {} (uid: {}), order not updated", 
                        status, transactionId, uid);
            }

        } catch (NumberFormatException e) {
            logger.warn("Invalid tracking_id format in webhook: {}", e.getMessage());
            return ResponseEntity.ok("OK"); // Return OK to prevent retries
        } catch (Exception e) {
            logger.error("Error processing webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Internal error");
        }

        return ResponseEntity.ok("OK");
    }

    // Проверка статуса — ДЁРГАЕТ bePaid напрямую! (даже если webhook не пришёл)
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkStatus(@RequestParam Long orderId) {
        Optional<Order> optOrder = orderRepository.findById(orderId);
        if (optOrder.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Заказ не найден"));
        }

        Order order = optOrder.get();

        // 1. Находим ВСЕ транзакции по этому заказу
        List<Transaction> transactions = transactionRepository.findAllByOrderId(order.getId());

        if (transactions.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "status", "PENDING",
                    "message", "Нет попыток оплаты"
            ));
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(shopId, secretKey);
        headers.set("Accept", "application/json");
        headers.set("X-API-Version", "3"); // Используем API v.3

        boolean hasSuccess = false;

        // 2. Проверяем каждую транзакцию в bePaid
        for (Transaction tx : transactions) {
            String trackingId = String.valueOf(tx.getId()); // ← это и есть tracking_id

            try {
                String url = "https://gateway.bepaid.by/v2/transactions/tracking_id/" + trackingId;
                ResponseEntity<Map> response = restTemplate.exchange(
                        url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);

                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    var body = response.getBody();

                    // bePaid может вернуть массив или объект
                    Object txData = body.get("transactions");
                    if (txData == null) txData = body.get("transaction");

                    if (txData instanceof java.util.List) {
                        var list = (java.util.List<Map<String, Object>>) txData;
                        if (!list.isEmpty() && "successful".equals(list.get(0).get("status"))) {
                            hasSuccess = true;
                            break;
                        }
                    } else if (txData instanceof Map) {
                        if ("successful".equals(((Map<?, ?>) txData).get("status"))) {
                            hasSuccess = true;
                            break;
                        }
                    }
                }
            } catch (Exception e) {
                // 404 или ошибка — просто пропускаем эту транзакцию
                logger.debug("Error checking transaction {} status: {}", tx.getId(), e.getMessage());
                continue;
            }
        }

        // 3. Если нашли хоть одну успешную — обновляем заказ
        if (hasSuccess) {
            processSuccessfulPayment(order);
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "status", hasSuccess ? "PAID" : "PENDING",
                "message", hasSuccess ? "Заказ оплачен" : "Оплата не найдена"
        ));
    }

    // Проверка подписи
    private boolean verifySignature(String payload, String header) {
        try {
            if (secretKey == null || secretKey.trim().isEmpty()) {
                logger.error("bePaid secret key is not configured");
                return false;
            }
            
            String[] parts = header.split("=", 2);
            if (parts.length != 2 || !"sha256".equals(parts[0])) {
                logger.warn("Invalid signature format: expected 'sha256=<hash>'");
                return false;
            }
            
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec key = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(key);
            byte[] hashBytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String calculatedHash = Base64.getEncoder().encodeToString(hashBytes);
            
            // Use constant-time comparison to prevent timing attacks
            return constantTimeEquals(calculatedHash, parts[1]);
        } catch (Exception e) {
            logger.error("Error verifying signature: {}", e.getMessage(), e);
            return false;
        }
    }
    
    // Constant-time string comparison to prevent timing attacks
    private boolean constantTimeEquals(String a, String b) {
        if (a.length() != b.length()) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }

    // DTO with validation
    public static class PaymentRequest {
        @NotNull(message = "Order ID is required")
        private Long orderId;
        
        @NotNull(message = "Amount is required")
        @Min(value = 0, message = "Amount must be non-negative")
        private Double amount;

        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }
        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }
    }
}
