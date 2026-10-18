
package com.project.CodeSync.AI_Backend.security;


import com.project.CodeSync.AI_Backend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Date;

@Component
public class AuthUtil {

    @Value("${jwt.secret-key}")
    private String jwtSecretKey;

    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(jwtSecretKey.getBytes(StandardCharsets.UTF_8));
    }
// This method converts your string into bytes, then wraps those bytes into a
// SecretKey object formatted for HMAC-SHA

    public String generateAccessToken(User user) {
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("userId", user.getId().toString())  // Adds custom data.
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000*60*10))
                .signWith(getSecretKey())
                .compact(); // Converts everything into one JWT string.
    }

    public JwtUserPrincipal verifyAccessToken(String token) {
        // "Is this JWT valid? If yes, who is the user?"
        Claims claims = Jwts.parser()// This tells the JWT library:
        // "I want to read and validate this token."
                .verifyWith(getSecretKey())//  checks the signature using the same secret key. If someone tampered with the token,
                .build() // Creates the parser with the verification configuration.
                .parseSignedClaims(token) // verify complete token
                .getPayload();

        Long userId = Long.parseLong(claims.get("userId", String.class));
        String username = claims.getSubject();
        return new JwtUserPrincipal(userId, username, new ArrayList<>());
    }

    public Long getCurrentUserId() {
        // Spring Security already knows because the JWT was verified.
        //It stores the logged-in user in the SecurityContext.

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // SecurityContextHolder as a box that Spring Security maintains for the current request.
        if(authentication == null || !(authentication.getPrincipal() instanceof JwtUserPrincipal userPrincipal)) {
           // "Is the principal actually a JwtUserPrincipal?"
            throw new AuthenticationCredentialsNotFoundException("No JWT Found");
        }
        return userPrincipal.userId();
    }

}
