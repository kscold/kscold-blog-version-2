package com.kscold.blog.identity.adapter.out.persistence;

import com.kscold.blog.identity.domain.model.PasswordResetToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface MongoPasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    void deleteByUserId(String userId);
}
