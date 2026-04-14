package com.kscold.blog.chat.application.service;

import com.kscold.blog.chat.adapter.out.mail.ChatReminderProperties;
import com.kscold.blog.chat.domain.port.out.ChatMessageRepository;
import com.kscold.blog.identity.adapter.out.mail.RecoveryEmailComposer;
import com.kscold.blog.identity.adapter.out.mail.RecoveryMailProperties;
import com.kscold.blog.identity.application.port.out.RecoveryMailSender;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatReminderScheduler {

    private final ChatApplicationService chatApplicationService;
    private final UserRepository userRepository;
    private final RecoveryMailSender recoveryMailSender;
    private final RecoveryEmailComposer recoveryEmailComposer;
    private final RecoveryMailProperties recoveryMailProperties;
    private final ChatReminderProperties chatReminderProperties;

    @Scheduled(fixedDelayString = "${chat.reminder.fixed-delay-ms:300000}")
    public void sendUnreadAdminReplyReminders() {
        if (!chatReminderProperties.isEnabled() || !recoveryMailSender.isAvailable()) {
            return;
        }

        LocalDateTime unreadBefore = LocalDateTime.now()
                .minusMinutes(chatReminderProperties.getUnreadThresholdMinutes());

        for (ChatMessageRepository.PendingAdminReminder reminder : chatApplicationService.getPendingAdminReminders(unreadBefore)) {
            userRepository.findById(reminder.roomId())
                    .ifPresent(user -> sendReminder(user, reminder, unreadBefore));
        }
    }

    private void sendReminder(
            User user,
            ChatMessageRepository.PendingAdminReminder reminder,
            LocalDateTime unreadBefore
    ) {
        try {
            recoveryMailSender.send(
                    recoveryEmailComposer.buildUnreadChatReminder(
                            user,
                            reminder.adminName(),
                            reminder.latestContent(),
                            reminder.unreadCount(),
                            recoveryMailProperties.resolvePublicUrl("/?chat=open")
                    )
            );
            chatApplicationService.markReminderSent(reminder.roomId(), unreadBefore);
        } catch (Exception exception) {
            log.warn("Unread chat reminder skipped for {}", user.getEmail(), exception);
        }
    }
}
