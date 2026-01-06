package com.example.demo.Repositories;

import com.example.demo.Entities.QuestProgress;
import com.example.demo.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuestProgressRepository extends JpaRepository<QuestProgress, Long> {
    Optional<QuestProgress> findByUserAndQuestId(User user, Long QuestId);
    List<QuestProgress> findByUser(User user);
}
