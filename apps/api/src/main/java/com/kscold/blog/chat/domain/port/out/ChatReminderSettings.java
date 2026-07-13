package com.kscold.blog.chat.domain.port.out;

public interface ChatReminderSettings {

    boolean isEnabled();

    long getUnreadThresholdMinutes();
}
