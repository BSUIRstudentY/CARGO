package com.example.demo.Repositories;

import com.example.demo.Entities.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    @Query("SELECT m FROM ChatMessage m WHERE m.ticket.id = :ticketId ORDER BY m.timestamp ASC")
    List<ChatMessage> findByTicketIdOrderByTimestampAsc(@Param("ticketId") Long ticketId);
}
