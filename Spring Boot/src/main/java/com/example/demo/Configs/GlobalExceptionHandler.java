package com.example.demo.Configs;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Global exception handler for centralized error handling across the application.
 * Provides consistent error responses and prevents information leakage.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handles validation errors from @Valid annotations.
     * Returns detailed field-level validation errors.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        Map<String, Object> response = createErrorResponse(
                "Validation failed",
                "Invalid input data",
                errors,
                HttpStatus.BAD_REQUEST
        );

        logger.warn("Validation error: {}", errors);
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Handles constraint violations (e.g., @NotNull, @Size).
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolationException(
            ConstraintViolationException ex) {
        Map<String, String> errors = ex.getConstraintViolations().stream()
                .collect(Collectors.toMap(
                        violation -> violation.getPropertyPath().toString(),
                        ConstraintViolation::getMessage
                ));

        Map<String, Object> response = createErrorResponse(
                "Constraint violation",
                "Input data violates constraints",
                errors,
                HttpStatus.BAD_REQUEST
        );

        logger.warn("Constraint violation: {}", errors);
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Handles authentication failures.
     * Does not expose sensitive information.
     */
    @ExceptionHandler({AuthenticationException.class, BadCredentialsException.class})
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(
            Exception ex) {
        Map<String, Object> response = createErrorResponse(
                "Authentication failed",
                "Invalid credentials or authentication token",
                null,
                HttpStatus.UNAUTHORIZED
        );

        logger.warn("Authentication error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    /**
     * Handles authorization failures (access denied).
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(
            AccessDeniedException ex) {
        Map<String, Object> response = createErrorResponse(
                "Access denied",
                "You do not have permission to access this resource",
                null,
                HttpStatus.FORBIDDEN
        );

        logger.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    /**
     * Handles type mismatch errors (e.g., invalid enum values, number format).
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex) {
        Map<String, Object> response = createErrorResponse(
                "Invalid parameter type",
                String.format("Parameter '%s' has invalid value '%s'. Expected type: %s",
                        ex.getName(),
                        ex.getValue(),
                        ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown"),
                null,
                HttpStatus.BAD_REQUEST
        );

        logger.warn("Type mismatch: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Handles IllegalArgumentException (business logic validation).
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(
            IllegalArgumentException ex) {
        Map<String, Object> response = createErrorResponse(
                "Invalid argument",
                ex.getMessage(),
                null,
                HttpStatus.BAD_REQUEST
        );

        logger.warn("Illegal argument: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Handles RuntimeException (business logic errors).
     * Converts certain RuntimeExceptions to appropriate HTTP status codes.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException ex) {
        String message = ex.getMessage();
        
        // Check if it's an authentication-related error (shouldn't happen with BadCredentialsException fix)
        if (message != null && message.contains("Invalid email or password")) {
            logger.warn("Authentication error: {}", message);
            Map<String, Object> response = createErrorResponse(
                    "Authentication failed",
                    "Invalid credentials",
                    null,
                    HttpStatus.UNAUTHORIZED
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        // Check if it's a duplicate user error
        if (message != null && message.contains("already exists")) {
            logger.warn("Duplicate entry: {}", message);
            Map<String, Object> response = createErrorResponse(
                    "Conflict",
                    message,
                    null,
                    HttpStatus.CONFLICT
            );
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
        
        // Check if it's an invalid referral code
        if (message != null && message.contains("Invalid referral code")) {
            logger.warn("Invalid referral code: {}", message);
            Map<String, Object> response = createErrorResponse(
                    "Invalid referral code",
                    message,
                    null,
                    HttpStatus.BAD_REQUEST
            );
            return ResponseEntity.badRequest().body(response);
        }
        
        // Default: treat as internal server error
        logger.error("RuntimeException occurred: {}", message, ex);
        Map<String, Object> response = createErrorResponse(
                "Internal server error",
                "An unexpected error occurred. Please try again later.",
                null,
                HttpStatus.INTERNAL_SERVER_ERROR
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * Handles all other unhandled exceptions.
     * Prevents information leakage by not exposing internal error details.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        logger.error("Unhandled exception occurred", ex);

        Map<String, Object> response = createErrorResponse(
                "Internal server error",
                "An unexpected error occurred. Please try again later.",
                null,
                HttpStatus.INTERNAL_SERVER_ERROR
        );

        // In production, don't expose stack traces
        // Only log detailed error for debugging
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * Creates a standardized error response structure.
     */
    private Map<String, Object> createErrorResponse(
            String error,
            String message,
            Object details,
            HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", status.value());
        response.put("error", error);
        response.put("message", message);
        if (details != null) {
            response.put("details", details);
        }
        return response;
    }
}






