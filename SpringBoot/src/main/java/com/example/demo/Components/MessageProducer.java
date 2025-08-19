/*
package com.example.demo.Components;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component  // Делает класс компонентом Spring, чтобы его можно инжектировать.
public class MessageProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;  // Инжектим template.
    private final String TOPIC = "my-topic";  // Название топика (можно вынести в конфиг).

    public MessageProducer(KafkaTemplate<String, String> kafkaTemplate) {  // Конструктор для инъекции.
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendMessage(String message) {
        kafkaTemplate.send(TOPIC, message);  // Отправка: топик, сообщение. Можно добавить ключ: send(TOPIC, "key", message).
        System.out.println("Сообщение отправлено: " + message);  // Лог для теста.
    }
}*/
