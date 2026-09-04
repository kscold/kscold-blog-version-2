package com.kscold.blog.chat.adapter.out.discord;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.kscold.blog.chat.application.port.in.ChatUseCase;
import com.kscold.blog.config.DiscordProperties;
import net.dv8tion.jda.api.entities.Guild;
import net.dv8tion.jda.api.entities.User;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DiscordMessageListenerTest {

    @Mock private DiscordThreadLinkService threadLinkService;
    @Mock private ChatUseCase chatUseCase;
    @Mock private MessageReceivedEvent event;
    @Mock private User author;
    @Mock private Guild guild;

    private DiscordMessageListener listener;

    @BeforeEach
    void setUp() {
        DiscordProperties properties = new DiscordProperties();
        properties.setGuildId("guild-1");
        properties.setChannelId("channel-1");
        listener = new DiscordMessageListener(threadLinkService, chatUseCase, properties);
    }

    @Test
    @DisplayName("설정되지 않은 서버의 메시지는 채팅으로 전달하지 않는다")
    void ignoresMessagesFromAnotherGuild() {
        when(event.getAuthor()).thenReturn(author);
        when(author.isBot()).thenReturn(false);
        when(event.isFromGuild()).thenReturn(true);
        when(event.getGuild()).thenReturn(guild);
        when(guild.getId()).thenReturn("guild-2");

        listener.onMessageReceived(event);

        verifyNoInteractions(threadLinkService, chatUseCase);
    }
}
