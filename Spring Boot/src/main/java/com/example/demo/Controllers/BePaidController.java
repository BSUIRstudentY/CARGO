package com.example.demo.Controllers;

import com.example.demo.Entities.Order;
import com.example.demo.Entities.QuestConditionType;
import com.example.demo.Entities.Transaction;
import com.example.demo.Entities.User;
import com.example.demo.POJO.QuestEvent;
import com.example.demo.Repositories.OrderRepository;
import com.example.demo.Repositories.TransactionRepository;
import com.example.demo.Repositories.UserRepository;
import com.example.demo.Services.ExchangeRateService;
import com.example.demo.Services.QuestService;
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
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;
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
    
    @Autowired
    private QuestService questService;
    
    @Autowired
    private ExchangeRateService exchangeRateService;

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

    /** RSA публичный ключ магазина из личного кабинета bePaid для проверки Content-Signature вебхуков (PEM). */
    @Value("${bepaid.public-key:}")
    private String publicKeyPem;

    private volatile PublicKey rsaPublicKey;

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

        // Фиксируем курс доставки при создании платежа
        if (order.getShippingRateFixed() == null) {
            Double currentShippingRate = exchangeRateService.getCurrentShippingRate();
            order.setShippingRateFixed(currentShippingRate);
            orderRepository.save(order);
            logger.info("Fixed shipping rate for order {}: {} USD/kg", request.getOrderId(), currentShippingRate);
        }

        // Проверяем, нужно ли вообще оплачивать (если сумма = 0)
        if (amountBYN <= 0) {
            logger.info("Payment amount is 0 for order {}, marking as PAID", request.getOrderId());
            // Используем processSuccessfulPayment для обработки квестов
            processSuccessfulPayment(order);
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
            if (order.getPhone() != null && !order.getPhone().isEmpty()) {
                customer.put("phone", order.getPhone());
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
        boolean wasNotPaid = !"PAID".equals(order.getStatus());
        
        if (wasNotPaid) {
            order.setStatus("PAID");
            orderRepository.save(order);
            logger.info("Order {} marked as PAID", order.getId());
        }

        // Обновляем потраченные средства пользователя и обрабатываем квесты (даже если заказ уже был PAID)
        User user = order.getUser();
        if (user != null && order.getTotalClientPrice() != null) {
            // Обновляем потраченные средства только если заказ только что был оплачен
            if (wasNotPaid) {
                double currentMoneySpent = user.getMoneySpent() != null ? user.getMoneySpent() : 0.0;
                double orderTotal = order.getTotalClientPrice().doubleValue();
                user.setMoneySpent(currentMoneySpent + orderTotal);
                
                userRepository.save(user);
                logger.info("Updated moneySpent for user {}: added {} CNY (total: {} CNY)", 
                    user.getEmail(), orderTotal, user.getMoneySpent());
            }
            
            // Квесты обрабатываем асинхронно после коммита, чтобы не держать транзакцию вебхука и не блокировать SQLite
            String userEmail = user.getEmail();
            if (wasNotPaid) {
                questService.handleEventAsync(new QuestEvent(userEmail, QuestConditionType.PURCHASE));
                questService.handleEventAsync(new QuestEvent(userEmail, QuestConditionType.QUANTITY_ORDER));
                questService.handleEventAsync(new QuestEvent(userEmail, QuestConditionType.SPENT));
                logger.info("Quest events scheduled async for user {}: PURCHASE, QUANTITY_ORDER, SPENT", userEmail);
            } else {
                questService.handleEventAsync(new QuestEvent(userEmail, QuestConditionType.SPENT));
            }
        }
    }

    // Webhook — находит транзакцию по tracking_id → получает заказ → обновляет статус заказа
    // bePaid: Content-Signature = RSA-подпись (проверка публичным ключом), авторизация — Basic (Shop ID + Secret Key)
    @PostMapping("/webhook")
    @Transactional
    public ResponseEntity<String> handleWebhook(HttpServletRequest httpRequest,
                                                @RequestBody String rawBody) {
        logWebhookHeaders(httpRequest, rawBody);

        String signature = firstNonEmpty(
                httpRequest.getHeader("X-API-Signature"),
                httpRequest.getHeader("X-Signature"),
                httpRequest.getHeader("Content-Signature"));
        boolean signatureValid = false;
        if (signature != null && !signature.trim().isEmpty()) {
            signatureValid = verifySignature(rawBody, signature);
            if (signatureValid) {
                logger.info("Webhook verified via Content-Signature (RSA)");
            }
        }
        if (!signatureValid && verifyWebhookBasicAuth(httpRequest)) {
            signatureValid = true;
            logger.info("Webhook verified via Basic Auth");
        }
        if (!signatureValid) {
            logger.warn("Webhook received without valid signature or Basic Auth");
            return ResponseEntity.status(400).body("Missing or invalid signature");
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
    @Transactional
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

        // 3. Если нашли хоть одну успешную — обновляем заказ (order в той же транзакции, User подгрузится при обращении)
        if (hasSuccess) {
            processSuccessfulPayment(order);
            logger.info("Payment check: order {} confirmed PAID via bePaid API", order.getId());
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "status", hasSuccess ? "PAID" : "PENDING",
                "message", hasSuccess ? "Заказ оплачен" : "Оплата не найдена"
        ));
    }

    /** Логируем заголовки webhook (без секретов) для отладки bePaid */
    private void logWebhookHeaders(HttpServletRequest httpRequest, String rawBody) {
        String auth = httpRequest.getHeader("Authorization");
        String apiSig = httpRequest.getHeader("X-API-Signature");
        String xSig = httpRequest.getHeader("X-Signature");
        String contentSig = httpRequest.getHeader("Content-Signature");
        logger.info("Webhook request: Authorization={}, X-API-Signature length={}, X-Signature length={}, Content-Signature length={}, body length={}",
                auth != null ? "present" : "absent",
                apiSig != null ? apiSig.length() : 0,
                xSig != null ? xSig.length() : 0,
                contentSig != null ? contentSig.length() : 0,
                rawBody != null ? rawBody.length() : 0);
        String sig = firstNonEmpty(apiSig, xSig, contentSig);
        if (sig != null && !sig.isEmpty()) {
            String preview = sig.length() > 50 ? sig.substring(0, 50) + "..." : sig;
            logger.info("Webhook signature format: prefix='{}', total length={}",
                    sig.contains("=") ? sig.substring(0, Math.min(sig.indexOf('=') + 1, sig.length())) : "(no equals)",
                    sig.length());
        }
    }

    /**
     * Проверка подписи вебхука по документации bePaid.
     * Content-Signature — RSA-подпись (закрытый ключ у bePaid), проверяем публичным ключом магазина.
     * Хэш: SHA256, тело — в том виде, как получено (без сериализации/десериализации JSON).
     */
    private boolean verifySignature(String payload, String header) {
        if (payload == null) {
            logger.warn("Webhook payload is null");
            return false;
        }
        PublicKey pubKey = getRsaPublicKey();
        if (pubKey == null) {
            logger.debug("bePaid public key not configured, Content-Signature verification skipped (use Basic Auth)");
            return false;
        }
        String trimmed = header.trim();
        if (trimmed.isEmpty()) {
            return false;
        }
        try {
            // Убираем префикс sha256= если есть; иначе вся строка — base64 подпись
            String base64Sig = trimmed.toLowerCase().startsWith("sha256=")
                    ? trimmed.substring(7).trim()
                    : trimmed;
            byte[] signatureBytes = Base64.getDecoder().decode(base64Sig);
            if (signatureBytes == null || signatureBytes.length == 0) {
                logger.warn("Webhook signature decode failed (empty or invalid base64)");
                return false;
            }

            Signature sig = Signature.getInstance("SHA256withRSA");
            sig.initVerify(pubKey);
            sig.update(payload.getBytes(StandardCharsets.UTF_8));
            boolean ok = sig.verify(signatureBytes);
            if (ok) {
                logger.debug("Webhook Content-Signature verified (RSA)");
            } else {
                logger.debug("Webhook Content-Signature verification failed (RSA verify returned false)");
            }
            return ok;
        } catch (Exception e) {
            logger.warn("Webhook signature verification error: {}", e.getMessage());
            return false;
        }
    }

    /** Ленивая инициализация RSA публичного ключа из PEM (bepaid.public-key). */
    private PublicKey getRsaPublicKey() {
        if (rsaPublicKey != null) {
            return rsaPublicKey;
        }
        if (publicKeyPem == null || publicKeyPem.trim().isEmpty()) {
            return null;
        }
        synchronized (this) {
            if (rsaPublicKey != null) {
                return rsaPublicKey;
            }
            try {
                String pem = publicKeyPem
                        .replace("-----BEGIN PUBLIC KEY-----", "")
                        .replace("-----END PUBLIC KEY-----", "")
                        .replaceAll("\\s", "");
                if (pem.isEmpty()) {
                    logger.warn("bePaid public key PEM is empty after stripping headers");
                    return null;
                }
                byte[] keyBytes = Base64.getDecoder().decode(pem);
                X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
                rsaPublicKey = KeyFactory.getInstance("RSA").generatePublic(spec);
                logger.info("bePaid RSA public key loaded for webhook verification");
                return rsaPublicKey;
            } catch (Exception e) {
                logger.error("Failed to load bePaid public key: {}", e.getMessage(), e);
                return null;
            }
        }
    }

    /** Сравнение строк с постоянным временем (защита от timing-атак при проверке Basic Auth). */
    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) {
            return a == b;
        }
        if (a.length() != b.length()) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }

    /** Первое непустое значение из строк, иначе null */
    private static String firstNonEmpty(String... values) {
        for (String v : values) {
            if (v != null && !v.trim().isEmpty()) return v;
        }
        return null;
    }

    /**
     * Проверка webhook через HTTP Basic Auth (Shop ID + Secret Key).
     * bePaid по документации может отправлять уведомления с Basic Auth вместо заголовка подписи.
     */
    private boolean verifyWebhookBasicAuth(HttpServletRequest httpRequest) {
        if (shopId == null || secretKey == null || shopId.trim().isEmpty() || secretKey.trim().isEmpty()) {
            return false;
        }
        String auth = httpRequest.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Basic ")) {
            return false;
        }
        try {
            String encoded = auth.substring(6).trim();
            String decoded = new String(Base64.getDecoder().decode(encoded), StandardCharsets.UTF_8);
            int colon = decoded.indexOf(':');
            if (colon <= 0) return false;
            String receivedShopId = decoded.substring(0, colon);
            String receivedSecret = decoded.substring(colon + 1);
            return constantTimeEquals(shopId, receivedShopId) && constantTimeEquals(secretKey, receivedSecret);
        } catch (IllegalArgumentException e) {
            logger.debug("Webhook Basic Auth decode failed: {}", e.getMessage());
            return false;
        }
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
