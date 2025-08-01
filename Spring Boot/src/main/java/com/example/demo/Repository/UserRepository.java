package com.example.demo.Repository;


import com.example.demo.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByName(String name); // Добавлен метод для поиска по имени
    boolean existsByEmail(String email);

}