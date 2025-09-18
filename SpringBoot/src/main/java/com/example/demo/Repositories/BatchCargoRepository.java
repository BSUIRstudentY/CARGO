package com.example.demo.Repositories;

import com.example.demo.Entities.BatchCargo;
import com.example.demo.Entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatchCargoRepository extends JpaRepository<BatchCargo, Long> {

    @Query("SELECT DISTINCT bc FROM BatchCargo bc JOIN bc.orders o WHERE o.user = :user")
    Page<BatchCargo> findByUser(User user, Pageable pageable);

    List<BatchCargo> findByStatusIn(List<String> statuses);

    @Query("SELECT b FROM BatchCargo b WHERE b.status = 'UNFINISHED'")
    List<BatchCargo> findUnfinishedBatches();

    @Query("SELECT b FROM BatchCargo b WHERE b.status = 'FINISHED'")
    List<BatchCargo> findFinishedBatches();

    @Query("SELECT DISTINCT bc FROM BatchCargo bc LEFT JOIN FETCH bc.orders o WHERE bc.id = :batchId AND (o IS NULL OR o.user.email = :userEmail)")
    Optional<BatchCargo> findByIdAndUserEmail(Long batchId, String userEmail);
}