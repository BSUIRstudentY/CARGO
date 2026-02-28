package com.example.demo.Services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

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
            helper.setText("Ваш код: " + code, true);
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

    public void sendPasswordResetCode(String recipient, String code) throws MessagingException {
        try {
            logger.info("Preparing to send password reset code to {}", recipient);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail, "Fluvion | Китай близко");
            helper.setTo(recipient);
            helper.setSubject("Сброс пароля");
            helper.setText("Ваш код для сброса пароля: " + code + "\n\nКод действителен в течение 15 минут.", true);
            mailSender.send(message);
            logger.info("Password reset email sent successfully to {}", recipient);
        } catch (MessagingException e) {
            logger.error("Failed to send password reset email to {}: {}", recipient, e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error sending password reset email to {}: {}", recipient, e.getMessage(), e);
            throw new MessagingException("Ошибка отправки email: " + e.getMessage(), e);
        }
    }

    public void sendOrderApprovalNotification(String recipient, Long orderId, String orderNumber, Float totalPrice, Double shippingRateFixed) throws MessagingException {
        try {
            logger.info("Preparing to send order approval notification to {}", recipient);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail, "Fluvion | Китай близко");
            helper.setTo(recipient);
            helper.setSubject("Ваш заказ одобрен");
            
            // Курс конвертации CNY в BYN (используется в системе)
            double CNY_TO_BYN_RATE = 0.45;
            float priceInBYN = (totalPrice != null ? totalPrice : 0.0f) * (float)CNY_TO_BYN_RATE;
            
            String emailBody = String.format(
                "<html><body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "<h2 style='color: #00f0ff;'>Ваш заказ одобрен!</h2>" +
                "<p>Здравствуйте!</p>" +
                "<p>Ваш заказ <strong>#%s</strong> (ID: %d) был одобрен администратором.</p>" +
                "<div style='background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;'>" +
                "<p style='margin: 0;'><strong>Сумма заказа:</strong> %.2f руб.</p>",
                orderNumber != null ? orderNumber : String.valueOf(orderId),
                orderId,
                priceInBYN
            );
            
            // Добавляем информацию о курсе доставки, если он зафиксирован
            if (shippingRateFixed != null) {
                emailBody += String.format(
                    "<p style='margin: 10px 0 0 0;'><strong>Курс доставки:</strong> <span style='color: #00f0ff; font-weight: bold;'>%.2f USD/кг</span></p>" +
                    "<p style='margin: 5px 0 0 0; font-size: 0.9em; color: #666;'>По этому курсу будет рассчитана стоимость доставки до РБ</p>",
                    shippingRateFixed
                );
            }
            
            emailBody += "</div>" +
                "<p>Вы можете отслеживать статус заказа в личном кабинете.</p>" +
                "<p>С уважением,<br>Команда Fluvion</p>" +
                "</div></body></html>";
            
            helper.setText(emailBody, true);
            mailSender.send(message);
            logger.info("Order approval email sent successfully to {}", recipient);
        } catch (MessagingException e) {
            logger.error("Failed to send order approval email to {}: {}", recipient, e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error sending order approval email to {}: {}", recipient, e.getMessage(), e);
            throw new MessagingException("Ошибка отправки email: " + e.getMessage(), e);
        }
    }

    @Async
    public void sendBatchCargoStatusChangeNotification(String recipient, Long batchId, String status, String batchTrackingNumber, List<OrderInfo> userOrders) {
        try {
            // Небольшая задержка, чтобы SQLite освободил блокировку после коммита основной транзакции
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.warn("Interrupted sleep before sending email");
        }
        
        try {
            logger.info("Preparing to send batch cargo status change notification to {}", recipient);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail, "Fluvion | Китай близко");
            helper.setTo(recipient);
            
            // Определяем тему и текст в зависимости от статуса
            String subject = getBatchStatusSubject(status);
            String statusText = getBatchStatusText(status);
            
            helper.setSubject(subject);
            
            String emailBody = String.format(
                "<html><body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "<h2 style='color: #00f0ff;'>%s</h2>" +
                "<p>Здравствуйте!</p>" +
                "<p>Статус сборного груза <strong>#%d</strong>, в котором участвуют ваши заказы, был изменён.</p>" +
                "<div style='background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;'>" +
                "<p style='margin: 0;'><strong>Новый статус:</strong> %s</p>",
                subject,
                batchId,
                statusText
            );
            
            if (batchTrackingNumber != null && !batchTrackingNumber.trim().isEmpty()) {
                emailBody += String.format(
                    "<p style='margin: 10px 0 0 0;'><strong>Трек-номер:</strong> %s</p>",
                    batchTrackingNumber
                );
            }
            
            emailBody += "</div>";
            
            // Добавляем информацию о заказах пользователя
            if (userOrders != null && !userOrders.isEmpty()) {
                // Курс конвертации CNY в BYN (используется в системе)
                double CNY_TO_BYN_RATE = 0.45;
                
                emailBody += "<div style='background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #00f0ff;'>" +
                    "<h3 style='margin-top: 0; color: #00f0ff;'>Ваши заказы в сборном грузе:</h3>" +
                    "<table style='width: 100%%; border-collapse: collapse;'>" +
                    "<thead>" +
                    "<tr style='background-color: #d0e8f0;'>" +
                    "<th style='padding: 8px; text-align: left; border-bottom: 2px solid #00f0ff;'>Номер заказа</th>" +
                    "<th style='padding: 8px; text-align: right; border-bottom: 2px solid #00f0ff;'>Сумма (руб.)</th>" +
                    "</tr>" +
                    "</thead>" +
                    "<tbody>";
                
                for (OrderInfo order : userOrders) {
                    // Конвертируем из юаней в рубли
                    float priceInBYN = (order.getTotalClientPrice() != null ? order.getTotalClientPrice() : 0.0f) * (float)CNY_TO_BYN_RATE;
                    emailBody += String.format(
                        "<tr>" +
                        "<td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>#%s</strong></td>" +
                        "<td style='padding: 8px; text-align: right; border-bottom: 1px solid #ddd;'>%.2f руб.</td>" +
                        "</tr>",
                        order.getOrderNumber() != null ? order.getOrderNumber() : String.valueOf(order.getId()),
                        priceInBYN
                    );
                }
                
                emailBody += "</tbody></table>";
                
                // Добавляем информацию о курсе доставки
                // Используем shippingRateFixed из первого заказа (они должны быть одинаковыми для одного пользователя)
                Double shippingRate = null;
                for (OrderInfo order : userOrders) {
                    if (order.getShippingRateFixed() != null) {
                        shippingRate = order.getShippingRateFixed();
                        break;
                    }
                }
                
                if (shippingRate != null) {
                    emailBody += String.format(
                        "<div style='margin-top: 15px; padding-top: 15px; border-top: 2px solid #00f0ff;'>" +
                        "<p style='margin: 0; color: #333;'><strong>Курс доставки:</strong> <span style='color: #00f0ff; font-weight: bold;'>%.2f USD/кг</span></p>" +
                        "<p style='margin: 5px 0 0 0; font-size: 0.9em; color: #666;'>По этому курсу будет рассчитана стоимость доставки до РБ</p>" +
                        "</div>",
                        shippingRate
                    );
                }
                
                emailBody += "</div>";
            }
            
            emailBody += "<p>Вы можете отслеживать статус сборного груза в разделе <strong>\"Сборные грузы\"</strong> в вашем личном кабинете.</p>" +
                "<p>С уважением,<br>Команда Fluvion</p>" +
                "</div></body></html>";
            
            helper.setText(emailBody, true);
            mailSender.send(message);
            logger.info("Batch cargo status change email sent successfully to {}", recipient);
        } catch (MessagingException e) {
            logger.error("Failed to send batch cargo status change email to {}: {}", recipient, e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error sending batch cargo status change email to {}: {}", recipient, e.getMessage(), e);
        }
    }

    private String getBatchStatusSubject(String status) {
        switch (status) {
            case "UNFINISHED":
                return "Сборный груз в процессе";
            case "PURCHASING":
                return "Закупка товаров";
            case "CHECKING":
                return "Проверка товаров";
            case "PACKAGING":
                return "Упаковка";
            case "SHIPPED":
                return "Сборный груз отправлен";
            case "ARRIVED_IN_MINSK":
                return "Сборный груз в Минске";
            case "COMPLETED":
            case "DELIVERED":
                return "Сборный груз доставлен";
            case "FINISHED":
                return "Сборный груз готов к отправке";
            case "IN_TRANSIT":
                return "Сборный груз в пути";
            case "AT_CUSTOMS":
                return "Сборный груз на таможне";
            case "REFUSED":
                return "Сборный груз отклонён";
            default:
                return "Изменение статуса сборного груза";
        }
    }

    private String getBatchStatusText(String status) {
        switch (status) {
            case "UNFINISHED":
                return "В процессе";
            case "PURCHASING":
                return "Закупка товаров";
            case "CHECKING":
                return "Проверка товаров";
            case "PACKAGING":
                return "Упаковка";
            case "SHIPPED":
                return "Отправлен";
            case "ARRIVED_IN_MINSK":
                return "В Минске";
            case "COMPLETED":
            case "DELIVERED":
                return "Доставлен";
            case "FINISHED":
                return "Готов к отправке";
            case "IN_TRANSIT":
                return "В пути";
            case "AT_CUSTOMS":
                return "На таможне";
            case "REFUSED":
                return "Отклонён";
            default:
                return status;
        }
    }

    /**
     * DTO для передачи информации о заказе в email
     */
    public static class OrderInfo {
        private Long id;
        private String orderNumber;
        private Float totalClientPrice; // В юанях
        private Double shippingRateFixed; // Курс доставки (USD за кг)

        public OrderInfo(Long id, String orderNumber, Float totalClientPrice, Double shippingRateFixed) {
            this.id = id;
            this.orderNumber = orderNumber;
            this.totalClientPrice = totalClientPrice;
            this.shippingRateFixed = shippingRateFixed;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getOrderNumber() {
            return orderNumber;
        }

        public void setOrderNumber(String orderNumber) {
            this.orderNumber = orderNumber;
        }

        public Float getTotalClientPrice() {
            return totalClientPrice;
        }

        public void setTotalClientPrice(Float totalClientPrice) {
            this.totalClientPrice = totalClientPrice;
        }

        public Double getShippingRateFixed() {
            return shippingRateFixed;
        }

        public void setShippingRateFixed(Double shippingRateFixed) {
            this.shippingRateFixed = shippingRateFixed;
        }
    }
}