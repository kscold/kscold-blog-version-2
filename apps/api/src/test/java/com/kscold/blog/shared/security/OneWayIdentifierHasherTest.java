package com.kscold.blog.shared.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class OneWayIdentifierHasherTest {

    @Test
    void 원문을_결정적인_SHA256_식별자로_변환한다() {
        String raw = "203.0.113.10|browser";

        String hashed = OneWayIdentifierHasher.hash(raw);

        assertThat(hashed)
                .hasSize(64)
                .matches("[0-9a-f]{64}")
                .isNotEqualTo(raw)
                .isEqualTo(OneWayIdentifierHasher.hash(raw));
    }
}
