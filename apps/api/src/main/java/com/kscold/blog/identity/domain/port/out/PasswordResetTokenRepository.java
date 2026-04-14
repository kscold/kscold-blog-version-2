package com.kscold.blog.identity.domain.port.out;

import com.kscold.blog.identity.domain.model.PasswordResetToken;

import java.util.Optional;

public interface PasswordResetTokenRepository {

    PasswordResetToken save(PasswordResetToken token);

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    void deleteByUserId(String userId);
}
