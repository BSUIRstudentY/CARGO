package com.example.demo.Repositories;

import com.example.demo.Entities.ExchangeRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.QueryHint;
import java.util.List;
import java.util.Optional;

/**
 * Repository for ExchangeRate entities.
 */
@Repository
public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {
    
    /**
     * Finds the active shipping rate (USD per kg).
     * @return Optional ExchangeRate with rateType = "SHIPPING_USD_PER_KG" and isActive = true
     */
    @Query("SELECT er FROM ExchangeRate er WHERE er.rateType = 'SHIPPING_USD_PER_KG' AND er.isActive = true ORDER BY er.updatedAt DESC")
    @QueryHints(@QueryHint(name = "org.hibernate.cacheable", value = "true"))
    Optional<ExchangeRate> findActiveShippingRate();

    /**
     * Finds all active rates by type.
     * @param rateType Type of rate to find
     * @return List of active ExchangeRate entities
     */
    @Query("SELECT er FROM ExchangeRate er WHERE er.rateType = :rateType AND er.isActive = true ORDER BY er.updatedAt DESC")
    List<ExchangeRate> findActiveRatesByType(@Param("rateType") String rateType);

    /**
     * Finds all rates (active and inactive) by type.
     * @param rateType Type of rate to find
     * @return List of ExchangeRate entities
     */
    @Query("SELECT er FROM ExchangeRate er WHERE er.rateType = :rateType ORDER BY er.updatedAt DESC")
    List<ExchangeRate> findAllRatesByType(@Param("rateType") String rateType);

    /**
     * Finds all active rates.
     * @return List of all active ExchangeRate entities
     */
    @Query("SELECT er FROM ExchangeRate er WHERE er.isActive = true ORDER BY er.updatedAt DESC")
    List<ExchangeRate> findAllActiveRates();
}




