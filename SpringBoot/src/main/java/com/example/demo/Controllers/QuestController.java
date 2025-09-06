package com.example.demo.Controllers;


import com.example.demo.Entities.Quest;
import com.example.demo.Entities.QuestConditionType;

import com.example.demo.Entities.RewardType;
import com.example.demo.Services.QuestService;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quest")
public class QuestController {

    @Autowired
    private QuestService questService;

    @PostMapping
    public void createQuest(@RequestBody Quest quest)
    {
        questService.createQuest(quest);
    }

}
