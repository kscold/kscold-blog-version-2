package com.kscold.blog.chat.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.kscold.blog.chat.domain.model.ChatMessage;
import com.kscold.blog.chat.domain.port.out.ChatBroadcastPort;
import com.kscold.blog.chat.domain.port.out.ChatMessageRepository;
import com.kscold.blog.chat.domain.port.out.ChatNotificationPort;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ChatApplicationServiceTest {

    @Mock private ChatMessageRepository chatMessageRepository;

    @Mock private ChatBroadcastPort broadcastPort;

    @Mock private ChatNotificationPort notificationPort;

    @InjectMocks private ChatApplicationService chatApplicationService;

    @Test
    @DisplayName("방문자 메시지를 저장하면 웹소켓과 외부 알림 채널로 함께 전달한다")
    void saveAndBroadcastDeliversVisitorMessageToBothChannels() {
        when(chatMessageRepository.save(any(ChatMessage.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ChatMessage saved =
                chatApplicationService.saveAndBroadcast(
                        "session-1",
                        "visitor",
                        "안녕하세요",
                        ChatMessage.MessageType.TEXT,
                        "room-1",
                        false);

        assertThat(saved.getRoomId()).isEqualTo("room-1");
        assertThat(saved.isFromAdmin()).isFalse();
        assertThat(saved.getVisitorReadAt()).isNotNull();
        verify(broadcastPort).broadcast(saved);
        verify(notificationPort).notifyMessage("room-1", "visitor", "안녕하세요", false);
    }

    @Test
    @DisplayName("디스코드에서 온 주인 답장은 저장과 웹소켓 전달만 수행한다")
    void receiveOwnerReplyDoesNotEchoToExternalNotificationChannel() {
        when(chatMessageRepository.save(any(ChatMessage.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ChatMessage saved =
                chatApplicationService.receiveOwnerReply("session-1", "kscold", "답변드립니다", "room-1");

        assertThat(saved.getUsername()).isEqualTo("kscold");
        assertThat(saved.isFromAdmin()).isTrue();
        assertThat(saved.getType()).isEqualTo(ChatMessage.MessageType.TEXT);
        verify(broadcastPort).broadcast(saved);
        verifyNoInteractions(notificationPort);
    }

    @Test
    @DisplayName("시스템 이벤트는 저장한 뒤 외부 알림 채널에만 전달한다")
    void recordSystemEventNotifiesExternalChannelWithoutBroadcast() {
        when(chatMessageRepository.save(any(ChatMessage.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        chatApplicationService.recordSystemEvent("room-1", "방문자가 입장했습니다");

        verify(notificationPort).notifySystem("room-1", "방문자가 입장했습니다");
        verifyNoInteractions(broadcastPort);
    }
}
