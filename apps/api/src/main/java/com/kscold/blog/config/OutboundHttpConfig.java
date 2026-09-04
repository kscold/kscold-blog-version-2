package com.kscold.blog.config;

import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.client.RestClientCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

@Configuration
@RequiredArgsConstructor
public class OutboundHttpConfig {

    private final OutboundHttpProperties properties;

    @Bean
    public RestClientCustomizer outboundRestClientCustomizer() {
        Duration connectTimeout =
                requirePositive(properties.getConnectTimeout(), "connect-timeout");
        Duration readTimeout = requirePositive(properties.getReadTimeout(), "read-timeout");

        return builder -> {
            SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
            requestFactory.setConnectTimeout(connectTimeout);
            requestFactory.setReadTimeout(readTimeout);
            builder.requestFactory(requestFactory);
        };
    }

    private Duration requirePositive(Duration duration, String propertyName) {
        if (duration == null || duration.isZero() || duration.isNegative()) {
            throw new IllegalStateException("outbound-http." + propertyName + " must be positive");
        }
        return duration;
    }
}
