package com.example.demo.Repositories;

import com.example.demo.Entities.Notification;
import com.example.demo.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long>, JpaSpecificationExecutor<Notification> {

    List<Notification> findByUserEmail(String userEmail);
    List<Notification> findByUserAndIsReadFalse(User user);

    List<Notification> findByUserAndIsReadTrue(User user);
}