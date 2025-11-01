package com.example.demo.Repositories;


import com.example.demo.Entities.User;
import io.lettuce.core.dynamic.annotation.Param;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.swing.text.html.Option;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Boolean existsByReferralCode(String code);
    Optional<User> findByReferralCode(String code);
    Optional<User> findByTelegramUserId(String telegramUserId);
    @Modifying
    @Transactional
    @Query("""
    UPDATE User u
    SET u.telegramUserId = :telegramId,
        u.telegramVerified = true
    WHERE u.referralCode = :referralCode
      AND (u.telegramUserId IS NULL OR u.telegramUserId = '')
""")
    int updateTelegramIdAndVerifyByReferralCodeIfEmpty(@Param("referralCode") String referralCode,
                                                       @Param("telegramId") String telegramId);

    long count();
}