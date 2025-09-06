package com.example.demo.Repositories;

import com.example.demo.Entities.Quest;
import com.example.demo.Entities.QuestConditionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestRepository extends JpaRepository<Quest, Long> {
    List<Quest> findByQuestConditionType(QuestConditionType questConditionType);
}
