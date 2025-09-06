package com.example.demo.POJO;

import com.example.demo.Entities.QuestConditionType;
import com.example.demo.Entities.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.awt.*;
import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class QuestEvent  implements Serializable {
    String userEmail;
    QuestConditionType questConditionType;
}
