package com.example.demo.Services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class GmailSenderService {

    private static final Logger logger = LoggerFactory.getLogger(GmailSenderService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public void sendVerificationCode(String recipient, String code) throws MessagingException {
        try {
            logger.info("Preparing to send verification code to {}", recipient);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail, "Fluvion | Китай близко");
            helper.setTo(recipient);
            helper.setSubject("Код верификации");
            helper.setText("Ваш код: " + code + "\n\nОтписаться: http://company.by/unsubscribe?email=" + recipient, true);
            mailSender.send(message);
            logger.info("Verification email sent successfully to {}", recipient);
        } catch (MessagingException e) {
            logger.error("Failed to send verification email to {}: {}", recipient, e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error sending email to {}: {}", recipient, e.getMessage(), e);
            throw new MessagingException("Ошибка отправки email: " + e.getMessage(), e);
        }
    }
}