package com.kscold.blog.identity.application.service;

import com.kscold.blog.identity.domain.model.PasswordResetToken;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.PasswordResetSettings;
import com.kscold.blog.identity.domain.port.out.PasswordResetTokenRepository;
import com.kscold.blog.notification.domain.port.out.PublicUrlResolver;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** 비밀번호 재설정 토큰을 먼저 저장하고 공개 재설정 주소를 만든다. */
@Component
@RequiredArgsConstructor
class PasswordResetTokenIssuer {

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PublicUrlResolver recoveryMailProperties;
    private final PasswordResetSettings passwordResetSettings;

    String issue(User user) {
        passwordResetTokenRepository.deleteByUserId(user.getId());
        String rawToken = PasswordResetTokenCodec.generate();
        Instant createdAt = Instant.now();
        PasswordResetToken savedToken =
                PasswordResetToken.builder()
                        .userId(user.getId())
                        .email(user.getEmail())
                        .tokenHash(PasswordResetTokenCodec.hash(rawToken))
                        .createdAt(createdAt)
                        .expiresAt(
                                createdAt.plusSeconds(
                                        passwordResetSettings.getPasswordResetExpiryMinutes() * 60))
                        .build();
        passwordResetTokenRepository.save(savedToken);
        return recoveryMailProperties.resolvePublicUrl("/login/reset-password?token=" + rawToken);
    }
}
