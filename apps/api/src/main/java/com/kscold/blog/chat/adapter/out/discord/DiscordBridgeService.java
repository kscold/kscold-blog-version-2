package com.kscold.blog.chat.adapter.out.discord;

import com.kscold.blog.chat.domain.port.out.ChatNotificationPort;
import com.kscold.blog.config.DiscordProperties;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import lombok.extern.slf4j.Slf4j;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.entities.channel.concrete.TextChannel;
import net.dv8tion.jda.api.entities.channel.concrete.ThreadChannel;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class DiscordBridgeService implements ChatNotificationPort {

    @Nullable private final JDA jda;
    private final DiscordThreadLinkService threadLinkService;
    private final DiscordProperties discordProperties;

    public DiscordBridgeService(
            @Nullable JDA jda,
            DiscordThreadLinkService threadLinkService,
            DiscordProperties discordProperties) {
        this.jda = jda;
        this.threadLinkService = threadLinkService;
        this.discordProperties = discordProperties;
    }

    @Override
    public void notifyMessage(String roomId, String username, String content, boolean fromAdmin) {
        if (fromAdmin) {
            sendAdminReplyToDiscord(roomId, username, content);
        } else {
            sendVisitorMessageToDiscord(roomId, username, content);
        }
    }

    @Override
    public void notifySystem(String roomId, String content) {
        if (!isConfigured()) return;

        String threadId = threadLinkService.findThreadIdByRoomId(roomId).orElse(null);
        if (threadId == null) return;

        try {
            ThreadChannel thread = jda.getThreadChannelById(threadId);
            if (isUsableThread(thread)) {
                thread.sendMessage("📋 " + content)
                        .queue(
                                ok -> {},
                                error ->
                                        log.error(
                                                "Discord 시스템 메시지 전송 실패: type={}",
                                                error.getClass().getSimpleName()));
            }
        } catch (Exception e) {
            log.error("Discord 시스템 메시지 전송 실패: type={}", e.getClass().getSimpleName());
        }
    }

    /** 블로그 방문자 메시지 → 디스코드 스레드로 전송 */
    private void sendVisitorMessageToDiscord(String roomId, String username, String content) {
        if (!isConfigured()) return;

        try {
            TextChannel channel = jda.getTextChannelById(discordProperties.getChannelId());
            if (channel == null) {
                log.error("Discord 채널을 찾을 수 없음");
                return;
            }
            if (!discordProperties.isConfiguredGuild(channel.getGuild().getId())) {
                log.error("Discord 채팅 채널이 설정된 서버에 속하지 않습니다.");
                return;
            }

            ThreadChannel thread = resolveThreadForRoom(jda, channel, roomId, username);

            if (thread == null) {
                log.error("Discord 스레드를 생성하거나 복구하지 못했습니다.");
                return;
            }

            thread.sendMessageEmbeds(DiscordMessageEmbeds.visitorMessage(username, content).build())
                    .queue(
                            ok -> {},
                            error ->
                                    log.error(
                                            "Discord 방문자 메시지 전송 실패: type={}",
                                            error.getClass().getSimpleName()));

        } catch (Exception e) {
            log.error("Discord 메시지 전송 실패: type={}", e.getClass().getSimpleName());
        }
    }

    /** 웹 어드민 답장 → 디스코드 스레드에 로깅 */
    private void sendAdminReplyToDiscord(String roomId, String adminName, String content) {
        if (!isConfigured()) return;

        String threadId = threadLinkService.findThreadIdByRoomId(roomId).orElse(null);
        if (threadId == null) return;

        try {
            ThreadChannel thread = jda.getThreadChannelById(threadId);
            if (isUsableThread(thread)) {
                thread.sendMessageEmbeds(
                                DiscordMessageEmbeds.adminReply(adminName, content).build())
                        .queue(
                                ok -> {},
                                error ->
                                        log.error(
                                                "Discord 어드민 답장 로깅 실패: type={}",
                                                error.getClass().getSimpleName()));
            }
        } catch (Exception e) {
            log.error("Discord 어드민 답장 로깅 실패: type={}", e.getClass().getSimpleName());
        }
    }

    private ThreadChannel resolveThreadForRoom(
            JDA jda, TextChannel channel, String roomId, String username) {
        String threadId = threadLinkService.findThreadIdByRoomId(roomId).orElse(null);
        ThreadChannel thread = threadId != null ? jda.getThreadChannelById(threadId) : null;

        if (thread != null && !thread.isArchived()) {
            return thread;
        }

        ThreadChannel recoveredThread =
                channel.getThreadChannels().stream()
                        .filter(candidate -> !candidate.isArchived())
                        .filter(
                                candidate ->
                                        username.equals(
                                                threadLinkService.extractVisitorName(
                                                        candidate.getName())))
                        .findFirst()
                        .orElse(null);
        if (recoveredThread != null) {
            threadLinkService.persistLink(roomId, recoveredThread.getId(), username);
            return recoveredThread;
        }

        String threadName =
                String.format(
                        "💬 %s (%s)",
                        username,
                        LocalDateTime.now().format(DateTimeFormatter.ofPattern("MM/dd HH:mm")));

        ThreadChannel createdThread =
                channel.createThreadChannel(threadName, false)
                        .setAutoArchiveDuration(ThreadChannel.AutoArchiveDuration.TIME_24_HOURS)
                        .complete();

        threadLinkService.persistLink(roomId, createdThread.getId(), username);

        createdThread
                .sendMessageEmbeds(DiscordMessageEmbeds.threadOpened(username, roomId).build())
                .queue(
                        ok -> {},
                        error ->
                                log.error(
                                        "Discord 스레드 오픈 안내 전송 실패: type={}",
                                        error.getClass().getSimpleName()));

        return createdThread;
    }

    private boolean isConfigured() {
        return jda != null
                && discordProperties.getChannelId() != null
                && !discordProperties.getChannelId().isBlank()
                && discordProperties.getGuildId() != null
                && !discordProperties.getGuildId().isBlank();
    }

    private boolean isUsableThread(@Nullable ThreadChannel thread) {
        return thread != null
                && !thread.isArchived()
                && discordProperties.isConfiguredGuild(thread.getGuild().getId());
    }
}
