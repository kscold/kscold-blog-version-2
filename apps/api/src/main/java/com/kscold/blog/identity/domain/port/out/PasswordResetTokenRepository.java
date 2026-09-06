package com.kscold.blog.identity.domain.port.out;

import com.kscold.blog.identity.domain.model.PasswordResetToken;
import java.util.Optional;

public interface PasswordResetTokenRepository {

    PasswordResetToken save(PasswordResetToken token);

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    /** 같은 토큰이 동시에 재사용되지 않도록 조회와 삭제를 원자적으로 수행한다. */
    Optional<PasswordResetToken> consumeByTokenHash(String tokenHash);

    void deleteByUserId(String userId);
}
