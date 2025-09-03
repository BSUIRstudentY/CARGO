package com.example.demo.Repositories;

import com.example.demo.Entities.BatchCargo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatchCargoRepository extends JpaRepository<BatchCargo, Long> {

    @Query("SELECT b FROM BatchCargo b WHERE b.status = 'UNFINISHED'")
    List<BatchCargo> findUnfinishedBatches();

    @Query("SELECT b FROM BatchCargo b WHERE b.status = 'FINISHED'")
    List<BatchCargo> findFinishedBatches();
}