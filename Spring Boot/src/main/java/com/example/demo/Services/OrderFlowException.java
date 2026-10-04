package com.example.demo.Services;

/**
 * Illegal order transition. Mapped to HTTP 400 with a Russian message.
 */
public class OrderFlowException extends RuntimeException {
    public OrderFlowException(String message) {
        super(message);
    }
}
