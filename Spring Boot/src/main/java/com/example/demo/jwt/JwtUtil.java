package com.example.demo.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);
    private static final int MIN_SECRET_KEY_LENGTH = 32; // Minimum 256 bits for HS256
    
    @Value("${jwt.secret}")
    private String SECRET_KEY;

    @Value("${jwt.expiration}")
    private long JWT_TOKEN_VALIDITY;
    
    private SecretKey signingKey;

    private SecretKey getSigningKey() {
        if (signingKey == null) {
            if (SECRET_KEY == null || SECRET_KEY.trim().isEmpty()) {
                throw new IllegalStateException("JWT secret key is not configured. Please set JWT_SECRET environment variable.");
            }
            if (SECRET_KEY.length() < MIN_SECRET_KEY_LENGTH) {
                logger.warn("JWT secret key is too short ({} < {}). Please use a longer key for production.", 
                        SECRET_KEY.length(), MIN_SECRET_KEY_LENGTH);
            }
            signingKey = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
        }
        return signingKey;
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (io.jsonwebtoken.security.SignatureException e) {
            logger.warn("Invalid JWT signature: {}", e.getMessage());
            throw new RuntimeException("Invalid token signature", e);
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            logger.debug("JWT token expired: {}", e.getMessage());
            throw new RuntimeException("Token expired", e);
        } catch (Exception e) {
            logger.error("Error parsing JWT token: {}", e.getMessage());
            throw new RuntimeException("Invalid token", e);
        }
    }

    private Boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (Exception e) {
            logger.debug("Error checking token expiration: {}", e.getMessage());
            return true; // Consider invalid if we can't parse expiration
        }
    }

    public String generateToken(String email, String role) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be null or empty");
        }
        if (role == null || role.trim().isEmpty()) {
            throw new IllegalArgumentException("Role cannot be null or empty");
        }
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        return createToken(claims, email);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_TOKEN_VALIDITY);
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public Boolean validateToken(String token, String email) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        
        try {
            final String extractedEmail = extractEmail(token);
            return extractedEmail.equals(email) && !isTokenExpired(token);
        } catch (Exception e) {
            logger.debug("Token validation failed: {}", e.getMessage());
            return false;
        }
    }
}