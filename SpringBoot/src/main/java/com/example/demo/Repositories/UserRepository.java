package com.example.demo.Repositories;


import com.example.demo.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Boolean existsByReferralCode(String code);
    Optional<User> findByReferralCode(String code);
    long count();
}