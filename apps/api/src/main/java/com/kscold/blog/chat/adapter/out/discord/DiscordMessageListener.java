package com.kscold.blog.chat.adapter.out.discord;

import com.kscold.blog.chat.application.port.in.ChatUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.dv8tion.jda.api.entities.channel.ChannelType;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 디스코드 스레드에서 주인이 남긴 답장을 수신하는 인바운드 어댑터. 스레드→roomId 매핑은 {@link DiscordThreadLinkService}로 조회하고,
 * 저장·방문자 전달은 {@link ChatUseCase#receiveOwnerReply}로 위임한다(어댑터끼리 직접 호출하지 않음).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DiscordMessageListener extends ListenerAdapter {

    private final DiscordThreadLinkService threadLinkService;
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
        String ownerName = event.getAuthor().getEffectiveName();
        String content = event.getMessage().getContentDisplay();

        if (content.isBlank()) return;

        String roomId = threadLinkService.getRoomIdByThread(threadId, event.getJDA());
        if (roomId == null) {
            log.warn("Discord → Blog: 스레드 매핑 없음 ({})", threadId);
            return;
        }

        log.info("Discord → Blog: {} in thread {}: {}", ownerName, threadId, content);

        // 저장 + 방문자 WebSocket 전달 (application 이 오케스트레이션)
        chatUseCase.receiveOwnerReply("discord-" + threadId, ownerName, content, roomId);
    }
}
