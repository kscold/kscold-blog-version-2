package com.kscold.blog.identity.application.service;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.identity.application.dto.response.PasswordResetTokenResponse;
import com.kscold.blog.identity.domain.model.PasswordResetToken;
import com.kscold.blog.identity.domain.port.out.PasswordResetTokenRepository;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 비밀번호 재설정 토큰 검증과 자격 정보 갱신을 담당한다. */
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final PasswordCredentialService passwordCredentialService;

    public PasswordResetTokenResponse validate(String token) {
        if (!PasswordResetTokenCodec.isValidInput(token)) {
            return new PasswordResetTokenResponse(false, "재설정 링크를 다시 확인해주세요.", null);
        }

        return passwordResetTokenRepository
                .findByTokenHash(PasswordResetTokenCodec.hash(token))
                .filter(savedToken -> !savedToken.isExpired(Instant.now()))
                .filter(
                        savedToken ->
                                userRepository.findActiveById(savedToken.getUserId()).isPresent())
                .map(
                        savedToken ->
                                new PasswordResetTokenResponse(
                                        true, "유효한 재설정 링크입니다.", savedToken.getExpiresAt()))
                .orElseGet(
                        () -> new PasswordResetTokenResponse(false, "만료되었거나 유효하지 않은 링크입니다.", null));
    }

    @Transactional(noRollbackFor = InvalidRequestException.class)
    public void reset(String token, String newPassword) {
        if (!PasswordResetTokenCodec.isValidInput(token)) {
            throw InvalidRequestException.invalidInput("재설정 링크를 다시 확인해주세요.");
        }

        PasswordResetToken savedToken = consumeValidToken(token);
        if (!passwordCredentialService.update(savedToken.getUserId(), newPassword)) {
            passwordResetTokenRepository.deleteByUserId(savedToken.getUserId());
            throw invalidResetLink();
        }
        passwordResetTokenRepository.deleteByUserId(savedToken.getUserId());
    }

    private PasswordResetToken consumeValidToken(String token) {
        PasswordResetToken savedToken =
                passwordResetTokenRepository
                        .consumeByTokenHash(PasswordResetTokenCodec.hash(token))
                        .orElseThrow(this::invalidResetLink);
        if (savedToken.isExpired(Instant.now())) {
            throw invalidResetLink();
        }
        return savedToken;
    }

    private InvalidRequestException invalidResetLink() {
        return InvalidRequestException.invalidInput("만료되었거나 유효하지 않은 링크입니다.");
    }
}
