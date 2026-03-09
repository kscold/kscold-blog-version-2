package com.kscold.blog.identity.infrastructure.security;

import com.kscold.blog.identity.application.port.out.TokenProvider;
import com.kscold.blog.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtTokenProviderAdapter implements TokenProvider {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public String createAccessToken(String userId, String role) {
        return jwtTokenProvider.createToken(userId, role);
    }

    @Override
    public String createRefreshToken(String userId, String role) {
        return jwtTokenProvider.createRefreshToken(userId, role);
    }

    @Override
    public boolean validateToken(String token) {
        return jwtTokenProvider.validateToken(token);
    }

    @Override
    public boolean isRefreshToken(String token) {
        return jwtTokenProvider.isRefreshToken(token);
    }

    @Override
    public String getUserId(String token) {
        return jwtTokenProvider.getUserId(token);
    }

    @Override
    public String getRole(String token) {
        return jwtTokenProvider.getRole(token);
    }
}
