package com.example.demo.Controllers;

import com.example.demo.Entities.ExchangeRate;
import com.example.demo.Services.ExchangeRateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller for managing exchange rates (shipping rates).
 */
@RestController
@RequestMapping("/api/exchange-rates")
public class ExchangeRateController {

    private static final Logger logger = LoggerFactory.getLogger(ExchangeRateController.class);

    @Autowired
    private ExchangeRateService exchangeRateService;

    /**
     * Gets the current active shipping rate (USD per kg).
     * Public endpoint - no authentication required.
     * @return Current shipping rate value
     */
    @GetMapping("/shipping/current")
    public ResponseEntity<Map<String, Object>> getCurrentShippingRate() {
        try {
            Double rate = exchangeRateService.getCurrentShippingRate();
            Optional<ExchangeRate> rateEntity = exchangeRateService.getActiveShippingRateEntity();
            
            Map<String, Object> response = new HashMap<>();
            response.put("rate", rate);
            response.put("currency", "USD");
            response.put("unit", "KG");
            if (rateEntity.isPresent()) {
                response.put("description", rateEntity.get().getDescription());
                response.put("updatedAt", rateEntity.get().getUpdatedAt());
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting current shipping rate", e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to retrieve shipping rate");
            error.put("rate", 6.0); // Fallback default
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Gets all active rates.
     * Public endpoint - no authentication required.
     * @return List of active rates
     */
    @GetMapping("/active")
    public ResponseEntity<List<ExchangeRate>> getAllActiveRates() {
        try {
            List<ExchangeRate> rates = exchangeRateService.getAllActiveRates();
            return ResponseEntity.ok(rates);
        } catch (Exception e) {
            logger.error("Error getting active rates", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Gets rates by type.
     * Admin only.
     * @param rateType Type of rate
     * @return List of rates
     */
    @GetMapping("/type/{rateType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ExchangeRate>> getRatesByType(@PathVariable String rateType) {
        try {
            List<ExchangeRate> rates = exchangeRateService.getRatesByType(rateType);
            return ResponseEntity.ok(rates);
        } catch (Exception e) {
            logger.error("Error getting rates by type: {}", rateType, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Sets a new shipping rate (deactivates old one and creates new).
     * Admin only.
     * @param request Request body with rate value and optional description
     * @return Created ExchangeRate entity
     */
    @PostMapping("/shipping")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExchangeRate> setShippingRate(@RequestBody Map<String, Object> request) {
        try {
            Double rateValue = Double.parseDouble(request.get("rateValue").toString());
            String description = request.containsKey("description") ? request.get("description").toString() : null;
            
            ExchangeRate rate = exchangeRateService.setShippingRate(rateValue, description);
            return ResponseEntity.ok(rate);
        } catch (Exception e) {
            logger.error("Error setting shipping rate", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Updates an existing rate.
     * Admin only.
     * @param id Rate ID
     * @param request Request body with rate value and optional description
     * @return Updated ExchangeRate entity
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExchangeRate> updateRate(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Double rateValue = Double.parseDouble(request.get("rateValue").toString());
            String description = request.containsKey("description") ? request.get("description").toString() : null;
            
            ExchangeRate rate = exchangeRateService.updateRate(id, rateValue, description);
            return ResponseEntity.ok(rate);
        } catch (Exception e) {
            logger.error("Error updating rate with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Deactivates a rate.
     * Admin only.
     * @param id Rate ID
     * @return Success response
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deactivateRate(@PathVariable Long id) {
        try {
            exchangeRateService.deactivateRate(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Rate deactivated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error deactivating rate with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to deactivate rate");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}

