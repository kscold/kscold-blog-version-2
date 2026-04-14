package com.kscold.blog.chat.application.service;

import com.kscold.blog.chat.adapter.out.mail.ChatReminderProperties;
import com.kscold.blog.chat.domain.port.out.ChatMessageRepository;
import com.kscold.blog.identity.adapter.out.mail.RecoveryEmailComposer;
import com.kscold.blog.identity.adapter.out.mail.RecoveryMailProperties;
import com.kscold.blog.identity.application.port.out.RecoveryMailMessage;
import com.kscold.blog.identity.application.port.out.RecoveryMailSender;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.support.UserFixtures;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatReminderSchedulerTest {

    @Mock
    private ChatApplicationService chatApplicationService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RecoveryMailSender recoveryMailSender;

    @Mock
    private RecoveryEmailComposer recoveryEmailComposer;

    @Mock
    private RecoveryMailProperties recoveryMailProperties;

    @Mock
    private ChatReminderProperties chatReminderProperties;

    @InjectMocks
    private ChatReminderScheduler chatReminderScheduler;

    @Test
    @DisplayName("시나리오: 미열람 관리자 답장이 일정 시간 지나면 사용자에게 메일 알림을 보낸다")
    void sendUnreadAdminReplyRemindersDeliversMail() {
        User user = UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
        ChatMessageRepository.PendingAdminReminder reminder =
                new ChatMessageRepository.PendingAdminReminder(
                        "user-1",
                        "관리자",
                        "새 답장을 남겼습니다.",
                        LocalDateTime.now().minusMinutes(40),
                        2
                );
        RecoveryMailMessage mailMessage = new RecoveryMailMessage(
                user.getEmail(),
                "[KSCOLD] 새 답장이 도착했습니다",
                "plain",
                "<html></html>"
        );

        when(chatReminderProperties.isEnabled()).thenReturn(true);
        when(chatReminderProperties.getUnreadThresholdMinutes()).thenReturn(30L);
        when(recoveryMailSender.isAvailable()).thenReturn(true);
        when(chatApplicationService.getPendingAdminReminders(any())).thenReturn(List.of(reminder));
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(recoveryMailProperties.resolvePublicUrl("/?chat=open")).thenReturn("https://kscold.com/?chat=open");
        when(recoveryEmailComposer.buildUnreadChatReminder(user, "관리자", "새 답장을 남겼습니다.", 2, "https://kscold.com/?chat=open"))
                .thenReturn(mailMessage);

        chatReminderScheduler.sendUnreadAdminReplyReminders();

        verify(recoveryMailSender).send(mailMessage);
        verify(chatApplicationService).markReminderSent(eq("user-1"), any());
    }

    @Test
    @DisplayName("시나리오: 메일 발송 설정이 없으면 미열람 알림은 보내지 않는다")
    void sendUnreadAdminReplyRemindersSkipsWhenMailUnavailable() {
        when(chatReminderProperties.isEnabled()).thenReturn(true);
        when(recoveryMailSender.isAvailable()).thenReturn(false);

        chatReminderScheduler.sendUnreadAdminReplyReminders();

        verify(chatApplicationService, never()).getPendingAdminReminders(any());
        verify(recoveryMailSender, never()).send(any());
    }
}
