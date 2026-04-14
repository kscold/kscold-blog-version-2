package com.kscold.blog.identity.adapter.out.mail;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "account-recovery")
public class RecoveryMailProperties {

    private String publicUrl = "https://kscold.com";
    private String fromAddress = "";
    private String fromName = "KSCOLD";
    private long passwordResetExpiryMinutes = 30;

    public String resolvePublicUrl(String path) {
        String base = StringUtils.trimTrailingCharacter(publicUrl.trim(), '/');
        String normalizedPath = path.startsWith("/") ? path : "/" + path;
        return base + normalizedPath;
    }
}
