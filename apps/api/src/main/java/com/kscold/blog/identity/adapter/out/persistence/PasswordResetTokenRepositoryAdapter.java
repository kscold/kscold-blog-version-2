package com.kscold.blog.identity.adapter.out.persistence;

import com.kscold.blog.identity.domain.model.PasswordResetToken;
import com.kscold.blog.identity.domain.port.out.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class PasswordResetTokenRepositoryAdapter implements PasswordResetTokenRepository {

    private final MongoPasswordResetTokenRepository mongoPasswordResetTokenRepository;

    @Override
    public PasswordResetToken save(PasswordResetToken token) {
        return mongoPasswordResetTokenRepository.save(token);
    }

    @Override
    public Optional<PasswordResetToken> findByTokenHash(String tokenHash) {
        return mongoPasswordResetTokenRepository.findByTokenHash(tokenHash);
    }

    @Override
    public void deleteByUserId(String userId) {
        mongoPasswordResetTokenRepository.deleteByUserId(userId);
    }
}
