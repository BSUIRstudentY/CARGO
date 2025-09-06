package com.example.demo.Controllers;

import com.example.demo.Entities.ChatMessage;
import com.example.demo.Entities.Ticket;
import com.example.demo.Entities.User;
import com.example.demo.POJO.SupportMessageEvent;
import com.example.demo.Repositories.ChatMessageRepository;
import com.example.demo.Repositories.TicketRepository;
import com.example.demo.Repositories.UserRepository;
import com.example.demo.Services.ChatService;
import lombok.Data;
import nonapi.io.github.classgraph.json.JSONUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Data
class ChatMessageDTO {
    private String message;
    private Long ticketId;
    private String email;
}

@Controller
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;



    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TicketRepository ticketRepository;

    public ChatController(ChatService chatService, SimpMessagingTemplate messagingTemplate, KafkaTemplate<String, Object> kafkaTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
        this.kafkaTemplate = kafkaTemplate;
    }



    // Общий маппинг для чата по тикету (от юзера или админа)
    @MessageMapping("/chat/{ticketId}")
    public void handleTicketChat(@DestinationVariable Long ticketId, @Payload ChatMessageDTO dto, SimpMessageHeaderAccessor headerAccessor) {

        System.out.println(dto.getEmail());
        User sender = userRepository.findByEmail(dto.getEmail()).orElseThrow(() -> new RuntimeException("Sender not found"));
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));
        User receiver;
        if(sender.equals(ticket.getUser()))
        {
            receiver = ticket.getAdmin();
        }
        else
        {
            receiver = ticket.getUser();
        }





        ChatMessage message = new ChatMessage();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setMessage(dto.getMessage());
        message.setTicket(ticket);

        ChatMessage saved = chatService.saveMessage(message);
        SupportMessageEvent event = new SupportMessageEvent(receiver, ticketId, sender.getUsername());
        kafkaTemplate.send("support", event.getUser().getEmail(), event)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        System.out.println("Событие отправлено в Kafka: ticketId=" + ticketId +
                                ", receiver=" + receiver.getEmail());
                    } else {
                        System.err.println("Ошибка отправки в Kafka: " + ex.getMessage());
                    }
                });
        // Рассылаем в topic тикета (оба участника подписаны)
        messagingTemplate.convertAndSend("/topic/ticket/" + ticketId, saved);
    }


}