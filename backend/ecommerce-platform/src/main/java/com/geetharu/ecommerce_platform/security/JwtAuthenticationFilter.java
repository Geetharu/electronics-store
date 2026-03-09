package com.geetharu.ecommerce_platform.security;

import com.geetharu.ecommerce_platform.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtUtils jwtUtils, UserRepository userRepository) {
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // 📝 Log 1: Check if header exists
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // This is normal for public GET requests, but bad for POST /api/products
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            if (jwtUtils.validateToken(token)) {
                String username = jwtUtils.getUsernameFromToken(token);

                userRepository.findByUsername(username).ifPresentOrElse(user -> {
                    String dbRole = user.getRole();

                    // 🛡️ Ensure Spring recognizes the role prefix
                    String finalRole = (dbRole != null && dbRole.startsWith("ROLE_"))
                            ? dbRole
                            : "ROLE_" + dbRole;

                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority(finalRole);

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            username, null, Collections.singletonList(authority));

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    // 📝 Log 2: Success
                    System.out.println("✅ Filter: Authenticated [" + username + "] with role [" + finalRole + "]");
                }, () -> {
                    // 📝 Log 3: Token valid but user not in DB
                    System.out.println("❌ Filter: Token valid but user [" + username + "] not found in Database!");
                });
            } else {
                System.out.println("❌ Filter: Token validation failed.");
            }
        } catch (Exception e) {
            System.out.println("❌ Filter: Error processing JWT - " + e.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}