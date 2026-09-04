package com.kscold.blog.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.Test;

class CorsOriginPolicyTest {

    @Test
    void normalizesExplicitOrigins() {
        CorsOriginPolicy policy =
                new CorsOriginPolicy(
                        " https://kscold.com,https://www.kscold.com,https://kscold.com ");

        assertThat(policy.allowedOrigins())
                .isEqualTo(List.of("https://kscold.com", "https://www.kscold.com"));
    }

    @Test
    void rejectsWildcardOrigin() {
        assertThatThrownBy(() -> new CorsOriginPolicy("*"))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void rejectsEmptyOrigins() {
        assertThatThrownBy(() -> new CorsOriginPolicy(" , "))
                .isInstanceOf(IllegalStateException.class);
    }
}
