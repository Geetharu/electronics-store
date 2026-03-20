package com.geetharu.ecommerce_platform.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;
import java.util.Base64;

@Component
public class JwtUtils {
    // 🛑 Replaced the random generator with a static base64-encoded secret key!
    // In production, this exact string should go in your application.properties or environment variables.
    private final String jwtSecret = "MySuperSecretKeyThatIsAtLeast32BytesLongForHS256Algorithm1234567890";

    private final Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
    private final int jwtExpirationMs = 86400000; // 24 hours

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            System.out.println("JWT Validation Error: " + e.getMessage());
            return false;
        }
    }
}