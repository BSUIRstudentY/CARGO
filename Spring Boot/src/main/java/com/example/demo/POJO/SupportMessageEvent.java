package com.example.demo.POJO;

import com.example.demo.Entities.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Service;

import java.io.Serializable;

@AllArgsConstructor
@Getter
@Setter
public class SupportMessageEvent implements Serializable
{
    private User user;
    private Long ticketId;
    private String senderName;

    public SupportMessageEvent() {}
}