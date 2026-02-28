package com.example.demo.Config;

import com.example.demo.Entities.ExchangeRate;
import com.example.demo.Repositories.ExchangeRateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Initializes default shipping rate if no active rate exists in the database.
 */
@Component
public class ExchangeRateInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(ExchangeRateInitializer.class);
    private static final Double DEFAULT_SHIPPING_RATE = 6.0;

    @Autowired
    private ExchangeRateRepository exchangeRateRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if there's an active shipping rate
        if (!exchangeRateRepository.findActiveShippingRate().isPresent()) {
            logger.info("No active shipping rate found. Creating default rate: {} USD/kg", DEFAULT_SHIPPING_RATE);
            
            ExchangeRate defaultRate = new ExchangeRate();
            defaultRate.setRateType("SHIPPING_USD_PER_KG");
            defaultRate.setRateValue(DEFAULT_SHIPPING_RATE);
            defaultRate.setCurrencyFrom("USD");
            defaultRate.setUnit("KG");
            defaultRate.setIsActive(true);
            defaultRate.setDescription("Default shipping rate from China to Belarus");
            
            exchangeRateRepository.save(defaultRate);
            logger.info("Default shipping rate created successfully: {} USD/kg", DEFAULT_SHIPPING_RATE);
        } else {
            logger.debug("Active shipping rate already exists in database");
        }
    }
}




