package com.kscold.blog.chat.adapter.out.discord;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Answers.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
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
import org.slf4j.LoggerFactory;

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

    @Test
    @DisplayName("관리자 답장 원문과 외부 식별자는 로그에 남기지 않는다")
    void doesNotLogOwnerReplyContentOrExternalIdentifiers() {
        MessageReceivedEvent messageEvent = mock(MessageReceivedEvent.class, RETURNS_DEEP_STUBS);
        String sensitiveOwner = "private-owner";
        String sensitiveContent = "never-log-this-private-reply";
        String sensitiveThreadId = "private-thread-id";
        String sensitiveRoomId = "private-room-id";

        when(messageEvent.getAuthor().isBot()).thenReturn(false);
        when(messageEvent.isFromGuild()).thenReturn(true);
        when(messageEvent.getGuild().getId()).thenReturn("guild-1");
        when(messageEvent.isFromType(
                        net.dv8tion.jda.api.entities.channel.ChannelType.GUILD_PUBLIC_THREAD))
                .thenReturn(true);
        when(messageEvent.getChannel().asThreadChannel().getParentChannel().getId())
                .thenReturn("channel-1");
        when(messageEvent.getChannel().getId()).thenReturn(sensitiveThreadId);
        when(messageEvent.getAuthor().getEffectiveName()).thenReturn(sensitiveOwner);
        when(messageEvent.getMessage().getContentDisplay()).thenReturn(sensitiveContent);
        when(threadLinkService.getRoomIdByThread(sensitiveThreadId, messageEvent.getJDA()))
                .thenReturn(sensitiveRoomId);

        Logger logger = (Logger) LoggerFactory.getLogger(DiscordMessageListener.class);
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
        try {
            listener.onMessageReceived(messageEvent);
        } finally {
            logger.detachAppender(appender);
            appender.stop();
        }

        verify(chatUseCase)
                .receiveOwnerReply(
                        "discord-" + sensitiveThreadId,
                        sensitiveOwner,
                        sensitiveContent,
                        sensitiveRoomId);
        assertThat(appender.list)
                .singleElement()
                .satisfies(
                        logEvent ->
                                assertThat(logEvent.getFormattedMessage())
                                        .contains("관리자 답장 수신")
                                        .doesNotContain(
                                                sensitiveOwner,
                                                sensitiveContent,
                                                sensitiveThreadId,
                                                sensitiveRoomId));
    }
}
