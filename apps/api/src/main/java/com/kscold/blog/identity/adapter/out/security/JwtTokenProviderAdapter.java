package com.kscold.blog.identity.adapter.out.security;

import com.kscold.blog.identity.application.port.out.TokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * TokenProvider 포트 구현체
 * 기존 JwtTokenProvider를 감싸는 어댑터
 */
@Component
@RequiredArgsConstructor
public class JwtTokenProviderAdapter implements TokenProvider {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public String createAccessToken(String userId, String role) {
        return jwtTokenProvider.createAccessToken(userId, role);
    }

    @Override
    public String createRefreshToken(String userId, String role) {
        return jwtTokenProvider.createRefreshToken(userId, role);
    }

    @Override
    public boolean validateAccessToken(String token) {
        return jwtTokenProvider.validateAccessToken(token);
    }

    @Override
    public boolean validateRefreshToken(String token) {
        return jwtTokenProvider.validateRefreshToken(token);
    }

    @Override
    public String getUserIdFromAccessToken(String token) {
        return jwtTokenProvider.getUserIdFromAccessToken(token);
    }

    @Override
    public String getUserIdFromRefreshToken(String token) {
        return jwtTokenProvider.getUserIdFromRefreshToken(token);
    }

    @Override
    public String getRoleFromAccessToken(String token) {
        return jwtTokenProvider.getRoleFromAccessToken(token);
    }
}
