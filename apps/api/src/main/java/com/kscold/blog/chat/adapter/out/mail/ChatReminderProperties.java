package com.kscold.blog.chat.adapter.out.mail;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "chat.reminder")
public class ChatReminderProperties {

    private boolean enabled = true;
    private long fixedDelayMs = 300000;
    private long unreadThresholdMinutes = 30;
}
