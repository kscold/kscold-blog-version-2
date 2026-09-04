package com.kscold.blog.chat.application.service;

import com.kscold.blog.chat.domain.port.out.ChatMessageRepository;
import com.kscold.blog.chat.domain.port.out.ChatReminderMailComposer;
import com.kscold.blog.chat.domain.port.out.ChatReminderSettings;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.notification.domain.port.out.MailSender;
import com.kscold.blog.notification.domain.port.out.PublicUrlResolver;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatReminderScheduler {

    private final ChatApplicationService chatApplicationService;
    private final UserRepository userRepository;
    private final MailSender recoveryMailSender;
    private final ChatReminderMailComposer mailComposer;
    private final PublicUrlResolver recoveryMailProperties;
    private final ChatReminderSettings chatReminderProperties;

    @Scheduled(fixedDelayString = "${chat.reminder.fixed-delay-ms:300000}")
    public void sendUnreadAdminReplyReminders() {
        if (!chatReminderProperties.isEnabled() || !recoveryMailSender.isAvailable()) {
            return;
        }

        LocalDateTime unreadBefore =
                LocalDateTime.now()
                        .minusMinutes(chatReminderProperties.getUnreadThresholdMinutes());

        for (ChatMessageRepository.PendingAdminReminder reminder :
                chatApplicationService.getPendingAdminReminders(unreadBefore)) {
            userRepository
                    .findById(reminder.roomId())
                    .ifPresent(user -> sendReminder(user, reminder, unreadBefore));
        }
    }

    private void sendReminder(
            User user,
            ChatMessageRepository.PendingAdminReminder reminder,
            LocalDateTime unreadBefore) {
        try {
            recoveryMailSender.send(
                    mailComposer.buildUnreadReminder(
                            user.getEmail(),
                            user.getDisplayName(),
                            reminder.adminName(),
                            reminder.latestContent(),
                            reminder.unreadCount(),
                            recoveryMailProperties.resolvePublicUrl("/?chat=open")));
            chatApplicationService.markReminderSent(reminder.roomId(), unreadBefore);
        } catch (Exception exception) {
            log.warn("Unread chat reminder skipped: type={}", exception.getClass().getSimpleName());
        }
    }
}
