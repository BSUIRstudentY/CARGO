package com.example.demo.Controllers;

import com.example.demo.Entities.Promocode;
import com.example.demo.Repositories.PromocodeRepository;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/promocodes")
public class PromocodeController {

    @Autowired
    private PromocodeRepository promocodeRepository;

    // New endpoint to fetch all promocodes
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Promocode>> getAllPromocodes() {
        List<Promocode> promocodes = promocodeRepository.findAll();
        return ResponseEntity.ok(promocodes);
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validatePromocode(@RequestBody PromocodeRequest promocodeRequest) {


        if (!promocodeRepository.existsByCode(promocodeRequest.getCode())) {
            System.out.println("doesnt exist");
            return ResponseEntity.badRequest().body("Промокод не существует");
        }

        Promocode promocode = promocodeRepository.findByCode(promocodeRequest.getCode()).orElse(null);
        if (promocode == null || !promocode.getIsActive()) {
            System.out.println("not active");
            return ResponseEntity.badRequest().body("Промокод неактивен");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(promocode.getValidFrom()) || now.isAfter(promocode.getValidUntil())) {
            System.out.println("not valid by date");
            return ResponseEntity.badRequest().body("Промокод недействителен по сроку");
        }

        if (promocode.getUsageLimit() != null && promocode.getUsedCount() >= promocode.getUsageLimit()) {
            System.out.println("limit");
            return ResponseEntity.badRequest().body("Промокод исчерпал лимит использований");
        }

        // Возвращаем тип скидки и значение
        return ResponseEntity.ok(new PromocodeResponse(promocode.getDiscountType().toString(), promocode.getDiscountValue()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createPromocode(@RequestBody Promocode promocode) {
        if (promocodeRepository.existsByCode(promocode.getCode())) {
            return ResponseEntity.badRequest().body("Промокод с таким кодом уже существует");
        }

        promocode.setUsedCount(0);
        promocode.setIsActive(true);
        promocodeRepository.save(promocode);
        return ResponseEntity.ok("Промокод создан успешно");
    }

    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> togglePromocode(@PathVariable Long id) {
        Promocode promocode = promocodeRepository.findById(id).orElse(null);
        if (promocode == null) {
            return ResponseEntity.badRequest().body("Промокод не найден");
        }

        promocode.setIsActive(!promocode.getIsActive());
        promocodeRepository.save(promocode);
        return ResponseEntity.ok("Статус промокода изменен на " + (promocode.getIsActive() ? "активен" : "неактивен"));
    }
}

class PromocodeResponse {
    private String discountType;
    private Float discountValue;

    public PromocodeResponse(String discountType, Float discountValue) {
        this.discountType = discountType;
        this.discountValue = discountValue;
    }

    public String getDiscountType() {
        return discountType;
    }

    public Float getDiscountValue() {
        return discountValue;
    }
}

class PromocodeRequest {
    private String code;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}