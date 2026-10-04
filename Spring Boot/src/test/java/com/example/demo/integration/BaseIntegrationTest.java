package com.example.demo.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Base class for integration tests.
 * Provides common setup for all controller integration tests.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@WithMockUser(username = "test@example.com", roles = "ADMIN")
public abstract class BaseIntegrationTest {

    @MockBean
    @SuppressWarnings("removal")
    protected JavaMailSender mailSender;

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @BeforeEach
    void stubMailSender() throws Exception {
        MimeMessage mimeMessage = new MimeMessage(Session.getDefaultInstance(new java.util.Properties()));
        Mockito.when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        Mockito.doNothing().when(mailSender).send(Mockito.any(MimeMessage.class));
    }

    /**
     * Helper method to convert object to JSON string
     */
    protected String asJsonString(final Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}








