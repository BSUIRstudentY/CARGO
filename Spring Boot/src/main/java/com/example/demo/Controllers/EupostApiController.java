
        package com.example.demo.Controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dostavka")
public class EupostApiController {

    private static final Logger logger = LoggerFactory.getLogger(EupostApiController.class);

    private static final List<String> SAFE_METHODS = Arrays.asList(
            "Addresses.Search4",
            "Addresses.GetAddressId",
            "Postal.DeliveryTypeDir",
            "Postal.TypesDir",
            "Postal.WeightTypeDir",
            "Postal.OfficesIn",
            "Postal.OfficesOut",
            "Postal.CalculationTariff",
            "Postal.Tracking",
            "Postal.HistoryOrders",
            "Postal.GetPDFContent",
            "Postal.DeliveryTime"
    );

    @Value("${eupost.api.url}")
    private String apiUrl;

    @Value("${eupost.service.number}")
    private String serviceNumber;

    @Value("${eupost.login}")
    private String login;

    @Value("${eupost.password}")
    private String password;

    private final RestTemplate restTemplate;
    private String jwtToken = null;
    private final ObjectMapper mapper = new ObjectMapper();

    public EupostApiController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @PostMapping("/auth")
    public ResponseEntity<?> getJwtToken() {
        try {
            fetchJwtToken();
            return ResponseEntity.ok(Map.of("jwt", jwtToken));
        } catch (ResourceAccessException e) {
            Throwable cause = e.getCause();
            if (cause instanceof UnknownHostException) {
                logger.error("Cannot resolve hostname for Eupost API: {}", apiUrl, e);
                return ResponseEntity.status(503).body(Map.of(
                    "error", "Service unavailable",
                    "message", "Unable to connect to delivery service. Please check your internet connection or try again later.",
                    "details", "Hostname cannot be resolved: " + (cause.getMessage() != null ? cause.getMessage() : "api.eurotorg.by")
                ));
            } else {
                logger.error("Network error connecting to Eupost API: {}", e.getMessage(), e);
                return ResponseEntity.status(503).body(Map.of(
                    "error", "Service unavailable",
                    "message", "Unable to connect to delivery service. Please try again later.",
                    "details", e.getMessage() != null ? e.getMessage() : "Network connection error"
                ));
            }
        } catch (HttpClientErrorException e) {
            return handleError(e);
        } catch (Exception e) {
            logger.error("Error fetching JWT: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error", "message", e.getMessage()));
        }
    }

    @GetMapping("/officesOut")
    public ResponseEntity<?> getOffices() {
        try {
            logger.info("Processing request for /api/dostavka/officesOut, apiUrl: {}", apiUrl);

            // Проверяем и обновляем JWT-токен, если он отсутствует или истёк
            if (jwtToken == null || isTokenExpired()) {
                logger.info("JWT token is null or expired, fetching new token");
                fetchJwtToken();
            }

            // Формируем тело запроса согласно документации
            ObjectNode packet = mapper.createObjectNode();
            packet.put("JWT", jwtToken);
            packet.put("MethodName", "Postal.OfficesOut");
            packet.put("ServiceNumber", serviceNumber);
            packet.set("Data", mapper.createObjectNode()); // Пустой Data, как указано в документации

            ObjectNode requestBodyNode = mapper.createObjectNode();
            requestBodyNode.put("CRC", "");
            requestBodyNode.set("Packet", packet);

            // Формируем URL
            String uriString = UriComponentsBuilder.fromHttpUrl(apiUrl).toUriString();
            logger.info("Sending request to external API: {}", uriString);
            logger.debug("Request body: {}", requestBodyNode.toString());

            // Настраиваем заголовки
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.CONTENT_TYPE, "application/json");

            HttpEntity<String> request = new HttpEntity<>(requestBodyNode.toString(), headers);

            // Выполняем запрос
            ResponseEntity<String> response = restTemplate.exchange(uriString, HttpMethod.POST, request, String.class);
            logger.info("Received response from external API, status: {}", response.getStatusCode());

            // Парсим ответ
            Map<String, Object> responseBody = mapper.readValue(response.getBody(), Map.class);

            // Проверяем наличие ошибки в ответе
            if (responseBody.containsKey("Table") && responseBody.get("Table") instanceof List) {
                List<?> table = (List<?>) responseBody.get("Table");
                if (!table.isEmpty() && table.get(0) instanceof Map) {
                    Map<?, ?> firstRow = (Map<?, ?>) table.get(0);
                    if (firstRow.containsKey("Error")) {
                        logger.error("External API returned error: {}", firstRow);
                        return ResponseEntity.status(500).body(Map.of("error", "API error", "details", firstRow));
                    }
                }
            }

            // Возвращаем успешный ответ
            return ResponseEntity.ok(responseBody);

        } catch (ResourceAccessException e) {
            Throwable cause = e.getCause();
            if (cause instanceof UnknownHostException) {
                logger.error("Cannot resolve hostname for Eupost API: {}", apiUrl, e);
                return ResponseEntity.status(503).body(Map.of(
                    "error", "Service unavailable",
                    "message", "Unable to connect to delivery service. Please check your internet connection or try again later.",
                    "details", "Hostname cannot be resolved: " + (cause.getMessage() != null ? cause.getMessage() : "api.eurotorg.by")
                ));
            } else {
                logger.error("Network error connecting to Eupost API: {}", e.getMessage(), e);
                return ResponseEntity.status(503).body(Map.of(
                    "error", "Service unavailable",
                    "message", "Unable to connect to delivery service. Please try again later.",
                    "details", e.getMessage() != null ? e.getMessage() : "Network connection error"
                ));
            }
        } catch (HttpClientErrorException e) {
            logger.error("HTTP error occurred: {}", e.getResponseBodyAsString(), e);
            if (e.getResponseBodyAsString().contains("неправильный Jwt") ||
                    e.getResponseBodyAsString().contains("не введен/неправильный Jwt")) {
                try {
                    logger.warn("JWT expired or invalid. Refreshing...");
                    fetchJwtToken();
                    return getOffices(); // Повторяем запрос с новым токеном
                } catch (Exception ex) {
                    logger.error("Failed to refresh JWT: {}", ex.getMessage());
                    return ResponseEntity.status(500).body(Map.of("error", "Failed to refresh JWT", "message", ex.getMessage()));
                }
            }
            return handleError(e);
        } catch (Exception e) {
            logger.error("Unexpected error in offices request: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error", "message", e.getMessage()));
        }
    }

    @PostMapping("/proxy")
    public ResponseEntity<?> proxyRequest(@RequestBody Map<String, Object> requestData) {
        try {
            if (jwtToken == null) {
                fetchJwtToken();
            }

            String methodName = (String) requestData.get("methodName");
            if (methodName == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "methodName is required"));
            }

            if (!SAFE_METHODS.contains(methodName)) {
                logger.warn("Attempt to call unsafe method: {}", methodName);
                return ResponseEntity.status(403).body(Map.of("error", "Method not allowed. Only safe methods are permitted."));
            }

            Map<String, Object> data = (Map<String, Object>) requestData.get("data");
            String httpMethodStr = (String) requestData.getOrDefault("httpMethod", "POST");
            HttpMethod httpMethod = HttpMethod.valueOf(httpMethodStr.toUpperCase());
            Map<String, String> customHeaders = (Map<String, String>) requestData.get("headers");
            Map<String, String> queryParams = (Map<String, String>) requestData.get("queryParams");

            String requestBodyStr = null;
            if (data != null && (httpMethod == HttpMethod.POST || httpMethod == HttpMethod.PUT)) {
                ObjectNode packet = mapper.createObjectNode();
                packet.put("JWT", jwtToken);
                packet.put("MethodName", methodName);
                packet.put("ServiceNumber", serviceNumber);
                packet.set("Data", mapper.valueToTree(data));

                ObjectNode requestBodyNode = mapper.createObjectNode();
                requestBodyNode.put("CRC", "");
                requestBodyNode.set("Packet", packet);
                requestBodyStr = requestBodyNode.toString();
            }

            UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(apiUrl);
            if (queryParams != null) {
                MultiValueMap<String, String> paramsMap = new LinkedMultiValueMap<>();
                queryParams.forEach(paramsMap::add);
                uriBuilder.queryParams(paramsMap);
            }
            String finalUrl = uriBuilder.toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            if (customHeaders != null) {
                customHeaders.forEach(headers::set);
            }

            HttpEntity<String> request = new HttpEntity<>(requestBodyStr, headers);
            ResponseEntity<String> response = restTemplate.exchange(finalUrl, httpMethod, request, String.class);

            Map<String, Object> responseBody = mapper.readValue(response.getBody(), Map.class);
            return ResponseEntity.ok(responseBody);
        } catch (ResourceAccessException e) {
            Throwable cause = e.getCause();
            if (cause instanceof UnknownHostException) {
                logger.error("Cannot resolve hostname for Eupost API: {}", apiUrl, e);
                return ResponseEntity.status(503).body(Map.of(
                    "error", "Service unavailable",
                    "message", "Unable to connect to delivery service. Please check your internet connection or try again later.",
                    "details", "Hostname cannot be resolved: " + (cause.getMessage() != null ? cause.getMessage() : "api.eurotorg.by")
                ));
            } else {
                logger.error("Network error connecting to Eupost API: {}", e.getMessage(), e);
                return ResponseEntity.status(503).body(Map.of(
                    "error", "Service unavailable",
                    "message", "Unable to connect to delivery service. Please try again later.",
                    "details", e.getMessage() != null ? e.getMessage() : "Network connection error"
                ));
            }
        } catch (HttpClientErrorException e) {
            if (e.getResponseBodyAsString().contains("неправильный Jwt") || e.getResponseBodyAsString().contains("не введен/неправильный Jwt")) {
                try {
                    logger.warn("JWT expired or invalid. Refreshing...");
                    fetchJwtToken();
                    return proxyRequest(requestData);
                } catch (Exception ex) {
                    logger.error("Failed to refresh JWT: {}", ex.getMessage());
                    return ResponseEntity.status(500).body(Map.of("error", "Failed to refresh JWT"));
                }
            }
            return handleError(e);
        } catch (Exception e) {
            logger.error("Error in proxy request: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error", "message", e.getMessage()));
        }
    }

    private void fetchJwtToken() throws Exception {
        logger.info("Fetching JWT token for ServiceNumber: {}", serviceNumber);
        ObjectNode packet = mapper.createObjectNode();
        ObjectNode data = mapper.createObjectNode();

        data.put("LoginName", login);
        data.put("Password", password);
        data.put("LoginNameTypeId", "1");

        packet.put("JWT", "null");
        packet.put("MethodName", "GetJWT");
        packet.put("ServiceNumber", serviceNumber);
        packet.set("Data", data);

        ObjectNode requestBody = mapper.createObjectNode();
        requestBody.put("CRC", "");
        requestBody.set("Packet", packet);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");

        HttpEntity<String> request = new HttpEntity<>(requestBody.toString(), headers);
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, request, String.class);

            Map<String, Object> responseBody = mapper.readValue(response.getBody(), Map.class);
            if (responseBody != null && responseBody.containsKey("Table")) {
                Map<String, Object> table = ((List<Map<String, Object>>) responseBody.get("Table")).get(0);
                if (table.containsKey("JWT")) {
                    jwtToken = (String) table.get("JWT");
                    logger.info("JWT token successfully fetched.");
                } else {
                    throw new RuntimeException("JWT not found in response");
                }
            } else {
                throw new RuntimeException("Invalid response from API");
            }
        } catch (ResourceAccessException e) {
            Throwable cause = e.getCause();
            if (cause instanceof UnknownHostException) {
                logger.error("Cannot resolve hostname when fetching JWT token: {}", apiUrl, e);
                throw new RuntimeException("Cannot connect to delivery service API. Hostname cannot be resolved: " + 
                    (cause.getMessage() != null ? cause.getMessage() : "api.eurotorg.by"), e);
            } else {
                logger.error("Network error when fetching JWT token: {}", e.getMessage(), e);
                throw new RuntimeException("Network error connecting to delivery service API: " + 
                    (e.getMessage() != null ? e.getMessage() : "Connection failed"), e);
            }
        }
    }

    private boolean isTokenExpired() {
        return false; // Замени на реальную проверку
    }

    private ResponseEntity<?> handleError(HttpClientErrorException e) {
        try {
            Map<String, Object> errorResponse = mapper.readValue(e.getResponseBodyAsString(), Map.class);
            logger.error("API error: {}", errorResponse);
            return ResponseEntity.status(e.getStatusCode()).body(errorResponse);
        } catch (Exception ex) {
            logger.error("Failed to parse error response: {}", ex.getMessage());
            return ResponseEntity.status(e.getStatusCode())
                    .body(Map.of("error", "Failed to parse error response", "message", e.getMessage()));
        }
    }
}