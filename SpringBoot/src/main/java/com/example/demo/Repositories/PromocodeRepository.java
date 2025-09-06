package com.example.demo.Repositories;

import com.example.demo.Entities.Promocode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PromocodeRepository extends JpaRepository<Promocode, Long> {
    boolean existsByCode(String code);
    Optional<Promocode> findByCode(String code);
}