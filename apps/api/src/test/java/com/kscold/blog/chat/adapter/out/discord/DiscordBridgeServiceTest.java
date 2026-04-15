package com.kscold.blog.chat.adapter.out.discord;

import com.kscold.blog.chat.domain.model.ChatDiscordThreadLink;
import com.kscold.blog.chat.domain.port.out.ChatDiscordThreadLinkRepository;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.support.UserFixtures;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.entities.channel.concrete.ThreadChannel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DiscordBridgeServiceTest {

    @Mock
    private JDA jda;

    @Mock
    private ChatDiscordThreadLinkRepository linkRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ThreadChannel threadChannel;

    private DiscordBridgeService discordBridgeService;

    @BeforeEach
    void setUp() {
        discordBridgeService = new DiscordBridgeService(jda, linkRepository, userRepository);
    }

    @Test
    @DisplayName("시나리오: 저장된 스레드 매핑이 있으면 재시작 후에도 roomId를 바로 찾는다")
    void getRoomIdByThreadUsesPersistedLink() {
        when(linkRepository.findByThreadId("thread-1"))
                .thenReturn(Optional.of(ChatDiscordThreadLink.builder()
                        .id("link-1")
                        .roomId("room-1")
                        .threadId("thread-1")
                        .visitorName("test")
                        .build()));

        String roomId = discordBridgeService.getRoomIdByThread("thread-1");

        assertThat(roomId).isEqualTo("room-1");
        verifyNoInteractions(jda);
    }

    @Test
    @DisplayName("시나리오: 저장된 매핑이 없어도 스레드 이름으로 방문자를 찾아 roomId를 복구한다")
    void getRoomIdByThreadRestoresFromThreadName() {
        User visitor = UserFixtures.user("room-2", User.Role.USER, "test", "test");

        when(linkRepository.findByThreadId("thread-2")).thenReturn(Optional.empty());
        when(jda.getThreadChannelById("thread-2")).thenReturn(threadChannel);
        when(threadChannel.getId()).thenReturn("thread-2");
        when(threadChannel.getName()).thenReturn("💬 test (04/15 00:08)");
        when(userRepository.findAllOrderByCreatedAtDesc()).thenReturn(List.of(visitor));
        when(linkRepository.findByRoomId("room-2")).thenReturn(Optional.empty());

        String roomId = discordBridgeService.getRoomIdByThread("thread-2");

        assertThat(roomId).isEqualTo("room-2");
        verify(linkRepository).save(argThat(link ->
                "room-2".equals(link.getRoomId())
                        && "thread-2".equals(link.getThreadId())
                        && "test".equals(link.getVisitorName())
        ));
    }
}
