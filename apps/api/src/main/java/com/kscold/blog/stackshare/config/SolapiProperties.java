package com.kscold.blog.stackshare.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "solapi")
public class SolapiProperties {

    private boolean enabled;
    private String apiKey = "";
    private String apiSecret = "";
    private String senderPhone = "";
    private String kakaoPfId = "";
    private String apiBaseUrl = "https://api.solapi.com";

    public boolean isConfigured() {
        return enabled
                && hasText(apiKey)
                && hasText(apiSecret)
                && hasText(senderPhone)
                && hasText(kakaoPfId);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
