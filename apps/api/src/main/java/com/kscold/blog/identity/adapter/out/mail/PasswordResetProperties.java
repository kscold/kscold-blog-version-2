package com.kscold.blog.identity.adapter.out.mail;

import com.kscold.blog.identity.domain.port.out.PasswordResetSettings;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "account-recovery")
public class PasswordResetProperties implements PasswordResetSettings {

    private long passwordResetExpiryMinutes = 30;
}
