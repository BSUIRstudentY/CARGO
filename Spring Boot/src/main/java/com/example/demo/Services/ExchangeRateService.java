package com.example.demo.Services;

import com.example.demo.Entities.ExchangeRate;
import com.example.demo.Repositories.ExchangeRateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for managing exchange rates, particularly shipping rates.
 */
@Service
@Transactional
public class ExchangeRateService {

    private static final Logger logger = LoggerFactory.getLogger(ExchangeRateService.class);
    private static final String DEFAULT_SHIPPING_RATE_TYPE = "SHIPPING_USD_PER_KG";
    private static final Double DEFAULT_SHIPPING_RATE_VALUE = 6.0; // Default fallback value

    @Autowired
    private ExchangeRateRepository exchangeRateRepository;

    /**
     * Gets the current active shipping rate (USD per kg).
     * If no active rate is found, returns the default value (6.0).
     * @return Current shipping rate value
     */
    public Double getCurrentShippingRate() {
        try {
            Optional<ExchangeRate> rate = exchangeRateRepository.findActiveShippingRate();
            if (rate.isPresent()) {
                Double rateValue = rate.get().getRateValue();
                logger.debug("Retrieved shipping rate from DB: {} USD/kg", rateValue);
                return rateValue;
            } else {
                logger.warn("No active shipping rate found in DB, using default: {} USD/kg", DEFAULT_SHIPPING_RATE_VALUE);
                return DEFAULT_SHIPPING_RATE_VALUE;
            }
        } catch (Exception e) {
            logger.error("Error retrieving shipping rate from DB, using default: {} USD/kg", DEFAULT_SHIPPING_RATE_VALUE, e);
            return DEFAULT_SHIPPING_RATE_VALUE;
        }
    }

    /**
     * Gets the ExchangeRate entity for the current active shipping rate.
     * @return Optional ExchangeRate entity
     */
    public Optional<ExchangeRate> getActiveShippingRateEntity() {
        return exchangeRateRepository.findActiveShippingRate();
    }

    /**
     * Creates or updates the shipping rate.
     * If an active rate exists, it will be deactivated and a new one will be created.
     * @param rateValue New rate value
     * @param description Optional description
     * @return Created ExchangeRate entity
     */
    public ExchangeRate setShippingRate(Double rateValue, String description) {
        // Deactivate existing active rates
        List<ExchangeRate> activeRates = exchangeRateRepository.findActiveRatesByType(DEFAULT_SHIPPING_RATE_TYPE);
        for (ExchangeRate rate : activeRates) {
            rate.setIsActive(false);
            exchangeRateRepository.save(rate);
        }

        // Create new active rate
        ExchangeRate newRate = new ExchangeRate();
        newRate.setRateType(DEFAULT_SHIPPING_RATE_TYPE);
        newRate.setRateValue(rateValue);
        newRate.setCurrencyFrom("USD");
        newRate.setUnit("KG");
        newRate.setIsActive(true);
        newRate.setDescription(description);

        ExchangeRate saved = exchangeRateRepository.save(newRate);
        logger.info("Created new shipping rate: {} USD/kg", rateValue);
        return saved;
    }

    /**
     * Gets all rates by type.
     * @param rateType Type of rate
     * @return List of ExchangeRate entities
     */
    public List<ExchangeRate> getRatesByType(String rateType) {
        return exchangeRateRepository.findAllRatesByType(rateType);
    }

    /**
     * Gets all active rates.
     * @return List of active ExchangeRate entities
     */
    public List<ExchangeRate> getAllActiveRates() {
        return exchangeRateRepository.findAllActiveRates();
    }

    /**
     * Updates an existing rate.
     * @param id Rate ID
     * @param rateValue New rate value
     * @param description Optional description
     * @return Updated ExchangeRate entity
     */
    public ExchangeRate updateRate(Long id, Double rateValue, String description) {
        ExchangeRate rate = exchangeRateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rate not found with id: " + id));
        
        rate.setRateValue(rateValue);
        if (description != null) {
            rate.setDescription(description);
        }
        
        ExchangeRate updated = exchangeRateRepository.save(rate);
        logger.info("Updated rate with id {}: {} USD/kg", id, rateValue);
        return updated;
    }

    /**
     * Deactivates a rate.
     * @param id Rate ID
     */
    public void deactivateRate(Long id) {
        ExchangeRate rate = exchangeRateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rate not found with id: " + id));
        
        rate.setIsActive(false);
        exchangeRateRepository.save(rate);
        logger.info("Deactivated rate with id: {}", id);
    }
}

