package com.kscold.blog.identity.application.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.identity.application.dto.command.ResetPasswordCommand;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PasswordResetTokenCodecTest {

    @Test
    @DisplayName("생성한 토큰은 256비트 URL 안전 문자열이다")
    void generateReturnsUrlSafeToken() {
        String token = PasswordResetTokenCodec.generate();

        assertThat(token).matches("[A-Za-z0-9_-]{43}");
    }

    @Test
    @DisplayName("같은 토큰은 항상 같은 SHA-256 해시로 변환된다")
    void hashReturnsExpectedSha256Value() {
        String hash = PasswordResetTokenCodec.hash("valid-reset-token");

        assertThat(hash)
                .isEqualTo("79902197833df66c53a7e9a88601f58cb91f4ec72bd113b8b5d686e6ca1dc3bc");
    }

    @Test
    @DisplayName("비어 있거나 제한보다 긴 토큰은 거부한다")
    void isValidInputRejectsInvalidToken() {
        assertThat(PasswordResetTokenCodec.isValidInput(null)).isFalse();
        assertThat(PasswordResetTokenCodec.isValidInput(" ")).isFalse();
        assertThat(
                        PasswordResetTokenCodec.isValidInput(
                                "a".repeat(ResetPasswordCommand.MAX_TOKEN_LENGTH + 1)))
                .isFalse();
    }

    @Test
    @DisplayName("최대 길이의 토큰은 허용한다")
    void isValidInputAcceptsMaximumLengthToken() {
        boolean isValid =
                PasswordResetTokenCodec.isValidInput(
                        "a".repeat(ResetPasswordCommand.MAX_TOKEN_LENGTH));

        assertThat(isValid).isTrue();
    }
}
