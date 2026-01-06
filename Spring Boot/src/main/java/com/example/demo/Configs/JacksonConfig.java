package com.example.demo.Configs;

import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule; // Add this import
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        Hibernate6Module hibernateModule = new Hibernate6Module();
        // Optional: Configure features, e.g., disable force lazy loading
        hibernateModule.configure(Hibernate6Module.Feature.FORCE_LAZY_LOADING, false);
        mapper.registerModule(hibernateModule);
        mapper.registerModule(new JavaTimeModule()); // Add this line
        return mapper;
    }
}