package com.kscold.blog.identity.domain.port.out;

import com.kscold.blog.identity.domain.model.TokenIdentity;
import java.util.Optional;

public interface TokenProvider {
    String createAccessToken(String userId, String role, long credentialVersion);

    String createRefreshToken(String userId, String role, long credentialVersion);

    Optional<TokenIdentity> parseAccessToken(String token);

    Optional<TokenIdentity> parseRefreshToken(String token);
}
