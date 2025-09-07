package com.example.demo.Controllers;

import com.example.demo.Entities.Quest;
import com.example.demo.Entities.QuestConditionType;
import com.example.demo.Entities.RewardType;
import com.example.demo.Services.QuestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quest")
public class QuestController {

    @Autowired
    private QuestService questService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> createQuest(@RequestBody Quest quest) {
        questService.createQuest(quest);
        return ResponseEntity.ok("Квест создан успешно");
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Quest>> getAllQuests() {
        List<Quest> quests = questService.getAllQuests();
        return ResponseEntity.ok(quests);
    }
}
