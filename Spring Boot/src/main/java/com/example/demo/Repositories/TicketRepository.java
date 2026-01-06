package com.example.demo.Repositories;

import com.example.demo.Entities.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByUserEmail(String email);
    @Query("SELECT t FROM Ticket t WHERE t.admin IS NULL")
    List<Ticket> findByAdminIsNull();

    @Query("SELECT t FROM Ticket t WHERE t.admin.email = :email")
    List<Ticket> findByAdmin_Email(@Param("email") String email);


}