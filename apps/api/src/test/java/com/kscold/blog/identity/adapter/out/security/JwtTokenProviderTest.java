package com.kscold.blog.identity.adapter.out.security;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.Base64;
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

    private JwtTokenProvider providerWithKeys(String accessKey, String refreshKey) {
        JwtTokenProvider provider = new JwtTokenProvider();
        ReflectionTestUtils.setField(provider, "secret", accessKey);
        ReflectionTestUtils.setField(provider, "refreshSecret", refreshKey);
        return provider;
    }
}
