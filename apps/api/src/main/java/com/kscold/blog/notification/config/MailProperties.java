package com.kscold.blog.notification.config;

import com.kscold.blog.notification.domain.port.out.PublicUrlResolver;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "account-recovery")
public class MailProperties implements PublicUrlResolver {

    private String publicUrl = "https://kscold.com";
    private String fromAddress = "";
    private String fromName = "KSCOLD";

    @Override
    public String resolvePublicUrl(String path) {
        String base = StringUtils.trimTrailingCharacter(publicUrl.trim(), '/');
        String normalizedPath = path.startsWith("/") ? path : "/" + path;
        return base + normalizedPath;
    }
}
