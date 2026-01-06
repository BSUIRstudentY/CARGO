package com.example.demo.integration;

import com.example.demo.Entities.Ticket;
import com.example.demo.Entities.TicketStatus;
import com.example.demo.Entities.User;
import com.example.demo.Repositories.TicketRepository;
import com.example.demo.Repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("TicketController Integration Tests")
class TicketControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private Ticket testTicket;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("ticketuser@example.com");
        testUser.setUsername("ticketuser");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setRole("USER");
        userRepository.save(testUser);

        testTicket = new Ticket();
        testTicket.setUser(testUser);
        testTicket.setTitle("Test Ticket");
        testTicket.setDescription("Test description");
        testTicket.setStatus(TicketStatus.OPEN);
        ticketRepository.save(testTicket);
    }

    @Test
    @DisplayName("POST /api/tickets/user - Should get user tickets")
    @WithMockUser(username = "ticketuser@example.com")
    void testGetUserTickets() throws Exception {
        String requestBody = """
                {
                    "userId": "ticketuser@example.com"
                }
                """;

        mockMvc.perform(post("/api/tickets/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("GET /api/tickets/{id} - Should get ticket by ID")
    @WithMockUser(username = "ticketuser@example.com")
    void testGetTicketById() throws Exception {
        mockMvc.perform(get("/api/tickets/" + testTicket.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testTicket.getId()))
                .andExpect(jsonPath("$.title").value("Test Ticket"));
    }

    @Test
    @DisplayName("POST /api/tickets - Should create ticket")
    @WithMockUser(username = "ticketuser@example.com")
    void testCreateTicket() throws Exception {
        String requestBody = """
                {
                    "title": "New Ticket",
                    "description": "Test description"
                }
                """;

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/tickets - Should get available tickets for admin")
    @WithMockUser(roles = "ADMIN")
    void testGetAvailableTickets() throws Exception {
        mockMvc.perform(get("/api/tickets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}

