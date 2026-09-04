package com.kscold.blog.analytics.application.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class IpAddressHasherTest {

    @Test
    void hashesIpAddressWithoutKeepingRawValue() {
        String raw = "203.0.113.10";

        String hashed = IpAddressHasher.hash(raw);

        assertThat(hashed)
                .hasSize(64)
                .matches("[0-9a-f]{64}")
                .isNotEqualTo(raw)
                .isEqualTo(IpAddressHasher.hash(raw));
    }
}
