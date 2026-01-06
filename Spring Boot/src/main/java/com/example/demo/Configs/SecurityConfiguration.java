package com.example.demo.Configs;

import com.example.demo.jwt.AuthTokenFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Security configuration with enhanced security features:
 * - JWT-based authentication
 * - CORS configuration
 * - Security headers
 * - Input validation
 * - Protection against common vulnerabilities
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class SecurityConfiguration {
    
    @Autowired
    private AuthTokenFilter authTokenFilter;

    @Autowired
    private UserDetailsService userDetailsService;

    @Value("${app.cors.allowed-origins:http://localhost:5173,https://fluvion.by}")
    private String[] allowedOrigins;

    /**
     * Public endpoints that don't require authentication.
     * Keep this list minimal for security.
     */
    private static final String[] WHITE_LIST_URL = {
            "/api/telegram",
            "/api/auth/**",
            "/api/products",
            "/api/cluster",
            "/ws/**",
            "/ws-pure/**",
            "/ws-notifications/**",
            "/api/catalog",
            "/api/payment/webhook", // Webhook needs to be public but should verify signature
            "/api/news", // Public news endpoints
            "/api/news/**", // Public news endpoints
            "/error" // Error endpoint
    };

    /**
     * Configures the security filter chain with:
     * - CSRF protection (disabled for stateless API, but can be enabled for stateful endpoints)
     * - CORS configuration
     * - Security headers
     * - JWT authentication filter
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF for stateless JWT-based API
                // Note: For stateful sessions, CSRF should be enabled
                .csrf(AbstractHttpConfigurer::disable)
                
                // CORS configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                
                // Authorization rules
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(WHITE_LIST_URL).permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                
                // Stateless session management for JWT
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                
                // Security headers
                .headers(headers -> headers
                        .xssProtection(xss -> xss.headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                        .contentSecurityPolicy(csp -> csp.policyDirectives(
                                "default-src 'self'; " +
                                "script-src 'self'; " +
                                "style-src 'self' 'unsafe-inline'; " +
                                "img-src 'self' data: https:; " +
                                "font-src 'self' data:; " +
                                "connect-src 'self';"
                        ))
                        .frameOptions(frame -> frame.deny()) // Prevent clickjacking
                        .httpStrictTransportSecurity(hsts -> hsts
                                .maxAgeInSeconds(31536000)
                                .includeSubDomains(true) // Правильное название метода в Spring Security 6.x
                        )
                )
                
                // Add JWT authentication filter before username/password filter
                .addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS configuration with security best practices.
     * Restricts origins, methods, and headers to minimize attack surface.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow specific origins (configure via application.yml)
        // In production, replace with actual frontend domain
        if (allowedOrigins != null && allowedOrigins.length > 0) {
            configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        } else {
            // Fallback for development
            configuration.setAllowedOriginPatterns(List.of("http://localhost:*", "https://*.fluvion.by"));
        }
        
        // Allowed HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        // Allowed headers
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
        ));
        
        // Exposed headers
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type"
        ));
        
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        // Cache preflight requests for 1 hour
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Password encoder using BCrypt with strength 12 (recommended for production).
     * BCrypt automatically handles salt generation and storage.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt strength 12 is a good balance between security and performance
        // Higher values (13-15) are more secure but slower
        return new BCryptPasswordEncoder(12);
    }

    /**
     * Authentication manager bean for programmatic authentication.
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}