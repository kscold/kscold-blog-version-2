package com.kscold.blog.identity.adapter.out.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.kscold.blog.identity.domain.model.TokenIdentity;
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
        JwtTokenProvider provider = initializedProvider();
        String token = signedAccessToken(provider, null, null);

        assertThat(provider.parseAccessToken(token)).isEmpty();
    }

    @Test
    void 발급한_토큰에서_자격_버전을_한번에_읽는다() {
        JwtTokenProvider provider = initializedProvider();

        String accessToken = provider.createAccessToken("user-1", "USER", 7L);
        String refreshToken = provider.createRefreshToken("user-1", "USER", 7L);

        assertThat(provider.parseAccessToken(accessToken))
                .contains(new TokenIdentity("user-1", 7L));
        assertThat(provider.parseRefreshToken(refreshToken))
                .contains(new TokenIdentity("user-1", 7L));
        assertThat(provider.parseAccessToken(refreshToken)).isEmpty();
    }

    @Test
    void 자격_버전이_없는_기존_토큰은_영으로_해석한다() {
        JwtTokenProvider provider = initializedProvider();
        String token = signedAccessToken(provider, "access", null);

        assertThat(provider.parseAccessToken(token)).contains(new TokenIdentity("user-1", 0L));
    }

    @Test
    void 문자열_자격_버전은_거부한다() {
        JwtTokenProvider provider = initializedProvider();
        String token = signedAccessToken(provider, "access", "1");

        assertThat(provider.parseAccessToken(token)).isEmpty();
    }

    @Test
    void 소수_자격_버전은_거부한다() {
        JwtTokenProvider provider = initializedProvider();
        String token = signedAccessToken(provider, "access", 1.0D);

        assertThat(provider.parseAccessToken(token)).isEmpty();
    }

    @Test
    void 음수_자격_버전은_거부한다() {
        JwtTokenProvider provider = initializedProvider();
        String token = signedAccessToken(provider, "access", -1L);

        assertThat(provider.parseAccessToken(token)).isEmpty();
    }

    private JwtTokenProvider initializedProvider() {
        String encodedKey = Base64.getEncoder().encodeToString(new byte[32]);
        JwtTokenProvider provider = providerWithKeys(encodedKey, encodedKey);
        provider.init();
        return provider;
    }

    private String signedAccessToken(JwtTokenProvider provider, String type, Object version) {
        SecretKey accessKey = (SecretKey) ReflectionTestUtils.getField(provider, "accessSecretKey");
        var builder =
                Jwts.builder()
                        .subject("user-1")
                        .issuedAt(new Date())
                        .expiration(new Date(System.currentTimeMillis() + 60_000));
        if (type != null) {
            builder.claim("type", type);
        }
        if (version != null) {
            builder.claim("credentialVersion", version);
        }
        return builder.signWith(accessKey, Jwts.SIG.HS256).compact();
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
