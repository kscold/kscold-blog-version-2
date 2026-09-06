package com.kscold.blog.identity.adapter.out.security;

import com.kscold.blog.identity.domain.model.TokenIdentity;
import com.kscold.blog.identity.domain.port.out.TokenProvider;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** TokenProvider 포트 구현체 기존 JwtTokenProvider를 감싸는 어댑터 */
@Component
@RequiredArgsConstructor
public class JwtTokenProviderAdapter implements TokenProvider {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public String createAccessToken(String userId, String role, long credentialVersion) {
        return jwtTokenProvider.createAccessToken(userId, role, credentialVersion);
    }

    @Override
    public String createRefreshToken(String userId, String role, long credentialVersion) {
        return jwtTokenProvider.createRefreshToken(userId, role, credentialVersion);
    }

    @Override
    public Optional<TokenIdentity> parseAccessToken(String token) {
        return jwtTokenProvider.parseAccessToken(token);
    }

    @Override
    public Optional<TokenIdentity> parseRefreshToken(String token) {
        return jwtTokenProvider.parseRefreshToken(token);
    }
}
