package com.kscold.blog.chat.adapter.out.discord;

import com.kscold.blog.chat.application.port.in.ChatUseCase;
import com.kscold.blog.chat.domain.model.ChatMessage;
import com.kscold.blog.chat.domain.port.out.ChatNotificationPort;
import lombok.extern.slf4j.Slf4j;
import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.entities.channel.concrete.TextChannel;
import net.dv8tion.jda.api.entities.channel.concrete.ThreadChannel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class DiscordBridgeService implements ChatNotificationPort {

    @Nullable
    private final JDA jda;
    private final ChatUseCase chatUseCase;

    @Value("${discord.channel-id:}")
    private String channelId;

    // roomId(userId) ↔ threadId 양방향 매핑
    private final ConcurrentHashMap<String, String> roomToThread = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> threadToRoom = new ConcurrentHashMap<>();

    public DiscordBridgeService(@Nullable JDA jda, ChatUseCase chatUseCase) {
        this.jda = jda;
        this.chatUseCase = chatUseCase;
    }

    /**
     * 블로그 방문자 메시지 → 디스코드 스레드로 전송
     */
    public void sendToDiscord(String roomId, String username, String content) {
        if (jda == null || channelId.isBlank()) return;

        try {
            TextChannel channel = jda.getTextChannelById(channelId);
            if (channel == null) {
                log.error("Discord 채널을 찾을 수 없음: {}", channelId);
                return;
            }

            String threadId = roomToThread.get(roomId);
            ThreadChannel thread = threadId != null ? jda.getThreadChannelById(threadId) : null;

            if (thread == null || thread.isArchived()) {
                // 새 스레드 생성
                String threadName = String.format("💬 %s (%s)",
                        username,
                        LocalDateTime.now().format(DateTimeFormatter.ofPattern("MM/dd HH:mm")));

                thread = channel.createThreadChannel(threadName, false)
                        .setAutoArchiveDuration(ThreadChannel.AutoArchiveDuration.TIME_24_HOURS)
                        .complete();

                roomToThread.put(roomId, thread.getId());
                threadToRoom.put(thread.getId(), roomId);

                // 스레드 시작 안내 메시지
                thread.sendMessageEmbeds(new EmbedBuilder()
                        .setTitle("새 채팅 시작")
                        .setDescription("**" + username + "** 님이 블로그에서 채팅을 시작했습니다.\n이 스레드에서 답장하면 방문자에게 전달됩니다.")
                        .setColor(new Color(30, 41, 59))
                        .build()
                ).queue();
            }

            // 방문자 메시지 전송
            thread.sendMessageEmbeds(new EmbedBuilder()
                    .setAuthor(username, null, null)
                    .setDescription(content)
                    .setColor(new Color(59, 130, 246))
                    .setTimestamp(java.time.Instant.now())
                    .build()
            ).queue();

        } catch (Exception e) {
            log.error("Discord 메시지 전송 실패: {}", e.getMessage());
        }
    }

    /**
     * 디스코드 스레드 답장 → 블로그 방문자에게 전달
     * DiscordMessageListener에서 호출
     */
    public void sendToBlog(String threadId, String adminName, String content) {
        String roomId = threadToRoom.get(threadId);
        if (roomId == null) {
            log.warn("스레드 매핑을 찾을 수 없음: {}", threadId);
            return;
        }

        // MongoDB에 저장
        chatUseCase.saveMessage(
                "discord-" + threadId,
                adminName,
                content,
                ChatMessage.MessageType.TEXT,
                roomId,
                true
        );

        // WebSocket으로 방문자에게 전달 (ChatWebSocketHandler에서 처리)
        if (blogMessageCallback != null) {
            blogMessageCallback.onAdminMessage(roomId, adminName, content);
        }
    }

    /**
     * 웹 어드민 답장 → 디스코드 스레드에 로깅
     */
    public void sendAdminReplyToDiscord(String roomId, String adminName, String content) {
        if (jda == null || channelId.isBlank()) return;

        String threadId = roomToThread.get(roomId);
        if (threadId == null) return;

        try {
            ThreadChannel thread = jda.getThreadChannelById(threadId);
            if (thread != null && !thread.isArchived()) {
                thread.sendMessageEmbeds(new EmbedBuilder()
                        .setAuthor("✉️ " + adminName + " (웹)", null, null)
                        .setDescription(content)
                        .setColor(new Color(34, 197, 94))
                        .setTimestamp(java.time.Instant.now())
                        .build()
                ).queue();
            }
        } catch (Exception e) {
            log.error("Discord 어드민 답장 로깅 실패: {}", e.getMessage());
        }
    }

    @Override
    public void notifyMessage(String roomId, String username, String content, boolean fromAdmin) {
        if (fromAdmin) {
            sendAdminReplyToDiscord(roomId, username, content);
        } else {
            sendToDiscord(roomId, username, content);
        }
    }

    /**
     * 방문자 입장/퇴장 시스템 메시지 디스코드 전달
     */
    public void sendSystemToDiscord(String roomId, String message) {
        if (jda == null || channelId.isBlank()) return;

        String threadId = roomToThread.get(roomId);
        if (threadId == null) return;

        try {
            ThreadChannel thread = jda.getThreadChannelById(threadId);
            if (thread != null && !thread.isArchived()) {
                thread.sendMessage("📋 " + message).queue();
            }
        } catch (Exception e) {
            log.error("Discord 시스템 메시지 전송 실패: {}", e.getMessage());
        }
    }

    /**
     * 스레드 ID → roomId 매핑 확인
     */
    public String getRoomIdByThread(String threadId) {
        return threadToRoom.get(threadId);
    }

    // 콜백 인터페이스 (ChatWebSocketHandler가 등록)
    public interface BlogMessageCallback {
        void onAdminMessage(String roomId, String adminName, String content);
    }

    private BlogMessageCallback blogMessageCallback;

    public void setBlogMessageCallback(BlogMessageCallback callback) {
        this.blogMessageCallback = callback;
    }
}
