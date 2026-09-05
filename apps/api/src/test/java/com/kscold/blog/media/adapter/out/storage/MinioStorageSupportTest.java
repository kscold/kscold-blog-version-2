package com.kscold.blog.media.adapter.out.storage;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class MinioStorageSupportTest {

    @Test
    @DisplayName("시나리오: MinIO 접근 키가 비어 있으면 시작을 거부한다")
    void rejectsBlankAccessKey() {
        assertThatThrownBy(() -> createSupport(" ", "configured-secret"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("minio.access-key must be configured");
    }

    @Test
    @DisplayName("시나리오: MinIO 비밀 키가 비어 있으면 시작을 거부한다")
    void rejectsBlankSecretKey() {
        assertThatThrownBy(() -> createSupport("configured-access", " "))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("minio.secret-key must be configured");
    }

    private MinioStorageSupport createSupport(String accessKey, String secretKey) {
        return new MinioStorageSupport(
                "http://localhost:9000",
                accessKey,
                secretKey,
                "blog",
                "https://bucket.example.com",
                "us-east-1");
    }
}
