package com.kscold.blog.payment;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "portone")
public class PortOnePaymentProperties {

    private String storeId = "";
    private String kakaoPayChannelKey = "";
    private String apiSecret = "";
    private String apiBaseUrl = "https://api.portone.io";

    public boolean isClientConfigured() {
        return hasText(storeId) && hasText(kakaoPayChannelKey);
    }

    public boolean isServerConfigured() {
        return hasText(apiSecret);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
