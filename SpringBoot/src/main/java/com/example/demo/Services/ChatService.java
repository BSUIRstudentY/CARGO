package com.example.demo.Services;


import com.example.demo.Entities.ChatMessage;
import com.example.demo.Repositories.ChatMessageRepository;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    private final ChatMessageRepository messageRepository;

    public ChatService(ChatMessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public ChatMessage saveMessage(ChatMessage message) {
        return messageRepository.save(message);
    }
}
