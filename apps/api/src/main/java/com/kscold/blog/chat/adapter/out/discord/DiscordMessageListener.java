package com.kscold.blog.chat.adapter.out.discord;

import com.kscold.blog.chat.application.port.in.ChatUseCase;
import com.kscold.blog.chat.domain.model.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.dv8tion.jda.api.entities.channel.ChannelType;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DiscordMessageListener extends ListenerAdapter {

    private final DiscordBridgeService discordBridgeService;
    private final ChatUseCase chatUseCase;

    @Value("${discord.channel-id:}")
    private String supportChannelId;

    @Override
    public void onMessageReceived(MessageReceivedEvent event) {
        if (event.getAuthor().isBot()) return;
        if (!event.isFromType(ChannelType.GUILD_PUBLIC_THREAD)) return;

        String parentId = event.getChannel().asThreadChannel().getParentChannel().getId();
        if (!parentId.equals(supportChannelId)) return;

        String threadId = event.getChannel().getId();
        String adminName = event.getAuthor().getEffectiveName();
        String content = event.getMessage().getContentDisplay();

        if (content.isBlank()) return;

        String roomId = discordBridgeService.getRoomIdByThread(threadId);
        if (roomId == null) {
            log.warn("Discord → Blog: 스레드 매핑 없음 ({})", threadId);
            return;
        }

        log.info("Discord → Blog: {} in thread {}: {}", adminName, threadId, content);

        // MongoDB에 저장
        chatUseCase.saveMessage(
                "discord-" + threadId,
                adminName,
                content,
                ChatMessage.MessageType.TEXT,
                roomId,
                true
        );

        // WebSocket으로 방문자에게 전달
        DiscordBridgeService.BlogMessageCallback callback = discordBridgeService.getBlogMessageCallback();
        if (callback != null) {
            callback.onAdminMessage(roomId, adminName, content);
        }
    }
}
