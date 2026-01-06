package com.example.demo.Configs;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Cache configuration for optimizing database queries.
 * Uses in-memory ConcurrentMapCacheManager for simple caching.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Cache names used throughout the application.
     */
    public static final String PRODUCTS_CACHE = "products";
    public static final String PRODUCT_CACHE = "product";
    public static final String CATALOG_CACHE = "catalog";
    public static final String USER_CACHE = "user";
    public static final String ORDER_CACHE = "order";
    public static final String PROMOCODE_CACHE = "promocode";
    public static final String BATCH_CARGO_CACHE = "batchCargo";

    /**
     * Primary cache manager using in-memory ConcurrentMapCacheManager.
     */
    @Bean
    @Primary
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(
                PRODUCT_CACHE,
                PRODUCTS_CACHE,
                USER_CACHE,
                ORDER_CACHE,
                PROMOCODE_CACHE,
                BATCH_CARGO_CACHE,
                CATALOG_CACHE
        );
    }
}





