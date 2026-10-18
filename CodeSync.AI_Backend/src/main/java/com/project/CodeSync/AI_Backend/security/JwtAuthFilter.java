package com.project.CodeSync.AI_Backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final AuthUtil authUtil;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        log.info(
                "Incoming request: {} {}",
                request.getMethod(),
                request.getRequestURI()
        );


        String authorization =
                request.getHeader("Authorization");


        log.info(
                "Authorization header present: {}",
                authorization != null
        );


        if (
                authorization == null ||
                        !authorization.startsWith("Bearer ")
        ) {

            log.warn(
                    "No Bearer token found for {}",
                    request.getRequestURI()
            );

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }



        String token =
                authorization.substring(7);


        try {

            JwtUserPrincipal user =
                    authUtil.verifyAccessToken(token);


            log.info(
                    "JWT valid. User ID: {}, username: {}",
                    user.userId(),
                    user.username()
            );


            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            user.authorities()
                    );


            SecurityContextHolder
                    .getContext()
                    .setAuthentication(
                            authentication
                    );


            log.info(
                    "Authentication successfully set."
            );


        } catch (Exception e) {

            log.error(
                    "JWT validation failed: {}",
                    e.getMessage(),
                    e
            );



            SecurityContextHolder
                    .clearContext();


            response.setStatus(
                    HttpServletResponse.SC_UNAUTHORIZED
            );

            response.setContentType(
                    "application/json"
            );

            response.getWriter().write(
                    """
                    {
                        "status": 401,
                        "message": "Invalid or expired JWT token"
                    }
                    """
            );

            return;
        }


        log.info(
                "Authentication before controller: {}",
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
        );


        filterChain.doFilter(
                request,
                response
        );


        log.info(
                "Response status: {}",
                response.getStatus()
        );
    }
}