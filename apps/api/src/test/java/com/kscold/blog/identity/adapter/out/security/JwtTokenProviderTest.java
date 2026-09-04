package com.kscold.blog.identity.adapter.out.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import io.jsonwebtoken.Jwts;
import java.util.Base64;
import java.util.Date;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class JwtTokenProviderTest {

    @Test
    void 서명_키가_256비트보다_짧으면_초기화를_거부한다() {
        JwtTokenProvider provider = providerWithKeys("short", "another-short-key");

        assertThrows(IllegalStateException.class, provider::init);
    }

    @Test
    void 서명_키가_256비트면_초기화할_수_있다() {
        String encodedKey = Base64.getEncoder().encodeToString(new byte[32]);
        JwtTokenProvider provider = providerWithKeys(encodedKey, encodedKey);

        assertDoesNotThrow(provider::init);
    }

    @Test
    void 액세스_타입이_없는_과거_토큰은_거부한다() {
        String encodedKey = Base64.getEncoder().encodeToString(new byte[32]);
        JwtTokenProvider provider = providerWithKeys(encodedKey, encodedKey);
        provider.init();
        SecretKey accessKey = (SecretKey) ReflectionTestUtils.getField(provider, "accessSecretKey");
        String legacyToken =
                Jwts.builder()
                        .subject("user-1")
                        .issuedAt(new Date())
                        .expiration(new Date(System.currentTimeMillis() + 60_000))
                        .signWith(accessKey, Jwts.SIG.HS256)
                        .compact();

        assertThat(provider.validateAccessToken(legacyToken)).isFalse();
    }

    @Test
    void 액세스_타입_토큰만_액세스_검증을_통과한다() {
        String encodedKey = Base64.getEncoder().encodeToString(new byte[32]);
        JwtTokenProvider provider = providerWithKeys(encodedKey, encodedKey);
        provider.init();

        String accessToken = provider.createAccessToken("user-1", "USER");
        String refreshToken = provider.createRefreshToken("user-1", "USER");

        assertThat(provider.validateAccessToken(accessToken)).isTrue();
        assertThat(provider.validateAccessToken(refreshToken)).isFalse();
    }

    private JwtTokenProvider providerWithKeys(String accessKey, String refreshKey) {
        JwtTokenProvider provider = new JwtTokenProvider();
        ReflectionTestUtils.setField(provider, "secret", accessKey);
        ReflectionTestUtils.setField(provider, "refreshSecret", refreshKey);
        ReflectionTestUtils.setField(provider, "validityInMilliseconds", 60_000L);
        ReflectionTestUtils.setField(provider, "refreshTokenValidity", 60_000L);
        return provider;
    }
}
