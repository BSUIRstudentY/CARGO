package com.example.demo.Controllers;

import com.example.demo.Components.ContextHolder;
import com.example.demo.Entities.ChatMessage;
import com.example.demo.Entities.Ticket;
import com.example.demo.Entities.TicketStatus;
import com.example.demo.Entities.User;
import com.example.demo.Repositories.ChatMessageRepository;
import com.example.demo.Repositories.TicketRepository;
import com.example.demo.Repositories.UserRepository;
import com.example.demo.Services.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketRepository ticketRepository;

    private final TicketService ticketService;
    private final UserRepository userRepository;
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    public TicketController(TicketService ticketService, UserRepository userRepository) {
        this.ticketService = ticketService;
        this.userRepository = userRepository;
    }

    // Получить все тикеты (для админа)

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('ADMIN')")  // Fixed the PreAuthorize annotation to standard format; adjust if custom
    public ResponseEntity<List<Ticket>> getAssignedTickets() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findById(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(ticketService.getTicketsByAdminEmail(currentUser.getEmail()));
    }

    // Updated endpoint for available (unassigned) tickets only
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")  // Fixed the PreAuthorize annotation to standard format; adjust if custom
    public ResponseEntity<List<Ticket>> getAvailableTickets() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findById(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(403).build(); // Только админы могут видеть
        }
        return ResponseEntity.ok(ticketService.getAvailableTickets());
    }

    // Получить тикеты конкретного юзера (изменено на POST с RequestBody)
    @PostMapping("/user")
    public ResponseEntity<List<Ticket>> getUserTickets(@RequestBody UserIdRequest request) {
        List<Ticket> tickets = ticketRepository.findByUserEmail(ContextHolder.getCurrentUserEmail());
        return ResponseEntity.ok(tickets);
    }

    public static class UserIdRequest {
        private String userId;

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }
    }

    // Получить тикет по ID (с автоматическим присвоением админа при первом открытии)
    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        Ticket ticket = ticketService.getTicketById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        User currentUser = userRepository.findById(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Проверка доступа: юзер-владелец или админ
        if (!currentUserEmail.equals(ticket.getUser().getEmail()) && !"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(403).build();
        }

        // Если админ открывает тикет и он не назначен, присваиваем этого админа
        if ("ADMIN".equals(currentUser.getRole()) && ticket.getAdmin() == null) {
            ticket = ticketService.assignAdmin(id, currentUserEmail);
        }

        return ResponseEntity.ok(ticket);
    }

    // Создать новый тикет (только для юзеров)
    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();

        User user = userRepository.findById(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).build(); // Админы не создают тикеты
        }

        ticket.setUser(user);
        return ResponseEntity.ok(ticketService.createTicket(ticket));
    }

    // Обновить статус тикета (только назначенный админ)
    @PatchMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status
    ) {
        Ticket ticket = ticketService.getTicketById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();

        if (ticket.getAdmin() == null || !currentUserEmail.equals(ticket.getAdmin().getEmail())) {
            return ResponseEntity.status(403).build(); // Только назначенный админ
        }

        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status));
    }

    // Назначить админа тикету (внутренний метод, но можно оставить для ручного присвоения)
    @PatchMapping("/{id}/assign/{adminId}")
    public ResponseEntity<Ticket> assignAdmin(
            @PathVariable Long id,
            @PathVariable String adminId
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findById(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(ticketService.assignAdmin(id, adminId));
    }

    // Удалить тикет (только админ или владелец)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        Ticket ticket = ticketService.getTicketById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();

        if (!currentUserEmail.equals(ticket.getUser().getEmail()) &&
                (ticket.getAdmin() == null || !currentUserEmail.equals(ticket.getAdmin().getEmail()))) {
            return ResponseEntity.status(403).build();
        }

        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/{ticketId}/messages")
    public List<ChatMessage> getChatMessages(@PathVariable Long ticketId) {
        return chatMessageRepository.findByTicketIdOrderByTimestampAsc(ticketId);
    }

}