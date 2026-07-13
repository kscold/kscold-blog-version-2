package com.kscold.blog.chat.adapter.out.mail;

import com.kscold.blog.chat.domain.port.out.ChatReminderSettings;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "chat.reminder")
public class ChatReminderProperties implements ChatReminderSettings {

    private boolean enabled = true;
    private long fixedDelayMs = 300000;
    private long unreadThresholdMinutes = 30;
}
