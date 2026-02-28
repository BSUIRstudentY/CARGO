package com.example.demo.POJO;

import com.example.demo.Entities.QuestConditionType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class QuestEvent  implements Serializable {
    String userEmail;
    QuestConditionType questConditionType;
}
