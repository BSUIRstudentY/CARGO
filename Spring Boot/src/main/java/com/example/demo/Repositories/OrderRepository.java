package com.example.demo.Repositories;

import com.example.demo.Entities.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.QueryHint;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Order entities with optimized queries.
 * Uses pagination for performance and query hints for read-only operations.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    @Override
    @QueryHints(@QueryHint(name = "org.hibernate.cacheable", value = "true"))
    Optional<Order> findById(Long id);
    
    /**
     * Finds order by order number (unique identifier).
     */
    @QueryHints(@QueryHint(name = "org.hibernate.cacheable", value = "true"))
    Optional<Order> findByOrderNumber(String orderNumber);
    
    // Non-paginated methods (use with caution - prefer paginated versions)
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    List<Order> findByUserEmail(String userEmail);
    
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    List<Order> findByUserEmailAndStatus(String userEmail, String status);
    
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    List<Order> findByStatus(String status);
    
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    List<Order> findByStatusIn(List<String> statuses);
    
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    List<Order> findByStatusNotIn(List<String> statuses);

    @Override
    long count();

    // Paginated methods (preferred for performance)
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    Page<Order> findByUserEmail(String userEmail, Pageable pageable);
    
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    Page<Order> findByUserEmailAndStatus(String userEmail, String status, Pageable pageable);
    
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    Page<Order> findByStatus(String status, Pageable pageable);
    
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    Page<Order> findByStatusIn(List<String> statuses, Pageable pageable);
    
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    Page<Order> findByStatusNotIn(List<String> statuses, Pageable pageable);
    
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    Page<Order> findByStatusNotInAndUserEmail(List<String> statuses, String userEmail, Pageable pageable);
    
    /**
     * Finds orders by tracking number (for shipment tracking).
     */
    @Query("SELECT o FROM Order o WHERE o.trackingNumber = :trackingNumber OR o.chinaTrackingNumber = :trackingNumber OR o.internationalTrackingNumber = :trackingNumber OR o.localTrackingNumber = :trackingNumber")
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    Optional<Order> findByAnyTrackingNumber(@Param("trackingNumber") String trackingNumber);
    
    /**
     * Counts orders by status for statistics.
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") String status);
    
    /**
     * Finds orders requiring customs clearance.
     */
    @Query("SELECT o FROM Order o WHERE o.customsStatus = 'PENDING' OR o.customsStatus IS NULL")
    @QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
    Page<Order> findOrdersRequiringCustomsClearance(Pageable pageable);
}