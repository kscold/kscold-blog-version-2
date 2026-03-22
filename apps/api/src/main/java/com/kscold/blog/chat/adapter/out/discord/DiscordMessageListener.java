package com.kscold.blog.chat.adapter.out.discord;

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

    @Value("${discord.channel-id:}")
    private String supportChannelId;

    @Override
    public void onMessageReceived(MessageReceivedEvent event) {
        // 봇 자신의 메시지 무시
        if (event.getAuthor().isBot()) return;

        // 스레드 메시지만 처리
        if (!event.isFromType(ChannelType.GUILD_PUBLIC_THREAD)) return;

        // support 채널의 스레드인지 확인
        String parentId = event.getChannel().asThreadChannel().getParentChannel().getId();
        if (!parentId.equals(supportChannelId)) return;

        String threadId = event.getChannel().getId();
        String adminName = event.getAuthor().getEffectiveName();
        String content = event.getMessage().getContentDisplay();

        if (content.isBlank()) return;

        log.info("Discord → Blog: {} in thread {}: {}", adminName, threadId, content);
        discordBridgeService.sendToBlog(threadId, adminName, content);
    }
}
