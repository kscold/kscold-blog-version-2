package com.kscold.blog.config;

import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** 자격 증명을 사용하는 HTTP와 WebSocket에 동일한 출처 허용 정책을 제공한다. */
@Component
public class CorsOriginPolicy {

    private final List<String> allowedOrigins;

    public CorsOriginPolicy(
            @Value("${cors.allowed-origins:http://localhost:3000}") String configuredOrigins) {
        List<String> origins =
                Arrays.stream(configuredOrigins.split(","))
                        .map(String::trim)
                        .filter(origin -> !origin.isBlank())
                        .distinct()
                        .toList();
        if (origins.isEmpty() || origins.contains("*")) {
            throw new IllegalStateException("자격 증명 요청에는 명시적인 CORS 출처가 필요합니다.");
        }
        this.allowedOrigins = List.copyOf(origins);
    }

    public List<String> allowedOrigins() {
        return allowedOrigins;
    }
}
