package com.kscold.blog.identity.adapter.out.persistence;

import com.kscold.blog.identity.domain.model.PasswordResetToken;
import com.kscold.blog.identity.domain.port.out.PasswordResetTokenRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PasswordResetTokenRepositoryAdapter implements PasswordResetTokenRepository {

    private final MongoPasswordResetTokenRepository mongoPasswordResetTokenRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public PasswordResetToken save(PasswordResetToken token) {
        return mongoPasswordResetTokenRepository.save(token);
    }

    @Override
    public Optional<PasswordResetToken> findByTokenHash(String tokenHash) {
        return mongoPasswordResetTokenRepository.findByTokenHash(tokenHash);
    }

    @Override
    public Optional<PasswordResetToken> consumeByTokenHash(String tokenHash) {
        Query query = Query.query(Criteria.where("tokenHash").is(tokenHash));
        return Optional.ofNullable(mongoTemplate.findAndRemove(query, PasswordResetToken.class));
    }

    @Override
    public void deleteByUserId(String userId) {
        mongoPasswordResetTokenRepository.deleteByUserId(userId);
    }
}
