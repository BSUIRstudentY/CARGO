package com.example.demo.Filters;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class SessionCreationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // Continue the filter chain first
        filterChain.doFilter(request, response);

        // Create session only if response is not committed and user is authenticated
        if (!response.isCommitted() &&
                SecurityContextHolder.getContext().getAuthentication() != null &&
                SecurityContextHolder.getContext().getAuthentication().isAuthenticated()) {
            System.out.println("Creating session for user: " +
                    SecurityContextHolder.getContext().getAuthentication().getName());
            request.getSession(true); // Create session if it doesn't exist
        }
    }
}