package com.kscold.blog.shared.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Slf4j
@Component
public class HttpAccessLogFilter extends OncePerRequestFilter {

    private static final String[] SKIP_PREFIXES = {"/actuator", "/uploads"};

    @Override
    protected void doFilterInternal(
            HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        long start = System.currentTimeMillis();
        try {
            chain.doFilter(req, res);
        } finally {
            long ms = System.currentTimeMillis() - start;
            log.info(
                    "[HTTP] {} {} authenticated={} → {} {}ms",
                    req.getMethod(),
                    req.getRequestURI(),
                    isAuthenticated(),
                    res.getStatus(),
                    ms);
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest req) {
        String uri = req.getRequestURI();
        for (String prefix : SKIP_PREFIXES) {
            if (uri.startsWith(prefix)) return true;
        }
        return false;
    }

    private boolean isAuthenticated() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return auth != null
                    && auth.isAuthenticated()
                    && !"anonymousUser".equals(auth.getPrincipal());
        } catch (Exception ignored) {
            return false;
        }
    }
}
