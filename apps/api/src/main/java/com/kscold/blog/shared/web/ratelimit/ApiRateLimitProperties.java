package com.kscold.blog.shared.web.ratelimit;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

/** API 요청 제한 설정. 규칙 자체는 {@link ApiRateLimitPolicies}에 코드로 둔다. */
@Getter
@Setter
@Validated
@Component
@ConfigurationProperties(prefix = "api.rate-limit")
public class ApiRateLimitProperties {

    private boolean enabled = true;

    /** X-Forwarded-For를 믿을 프록시 주소 범위(CIDR, 쉼표 구분). 운영 Nginx는 Docker 내부망에서 들어온다. */
    private String trustedProxies = "127.0.0.0/8,::1/128,172.16.0.0/12";

    @Min(1)
    private long maxTrackedClients = 100_000;
}
