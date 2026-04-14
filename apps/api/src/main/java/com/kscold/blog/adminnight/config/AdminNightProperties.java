package com.kscold.blog.adminnight.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "admin-night")
public class AdminNightProperties {

    private String adminEmail = "developerkscold@gmail.com";
    private String adminName = "김승찬";
}
