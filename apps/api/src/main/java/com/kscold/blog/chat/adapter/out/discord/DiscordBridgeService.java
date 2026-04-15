package com.kscold.blog.chat.adapter.out.discord;

import com.kscold.blog.chat.domain.model.ChatDiscordThreadLink;
import com.kscold.blog.chat.domain.model.ChatMessage;
import com.kscold.blog.chat.domain.port.out.ChatDiscordThreadLinkRepository;
import com.kscold.blog.chat.domain.port.out.ChatNotificationPort;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
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
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class DiscordBridgeService implements ChatNotificationPort {

    @Nullable
    private final JDA jda;

    @Value("${discord.channel-id:}")
    private String channelId;

    private final ConcurrentHashMap<String, String> roomToThread = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> threadToRoom = new ConcurrentHashMap<>();
    private final ChatDiscordThreadLinkRepository linkRepository;
    private final UserRepository userRepository;

    public DiscordBridgeService(
            @Nullable JDA jda,
            ChatDiscordThreadLinkRepository linkRepository,
            UserRepository userRepository
    ) {
        this.jda = jda;
        this.linkRepository = linkRepository;
        this.userRepository = userRepository;
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

            ThreadChannel thread = resolveThreadForRoom(channel, roomId, username);

            if (thread == null) {
                log.error("Discord 스레드를 생성하거나 복구하지 못했습니다. roomId={}", roomId);
                return;
            }

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
     * 웹 어드민 답장 → 디스코드 스레드에 로깅
     */
    public void sendAdminReplyToDiscord(String roomId, String adminName, String content) {
        if (jda == null || channelId.isBlank()) return;

        String threadId = findThreadIdByRoomId(roomId).orElse(null);
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

        String threadId = findThreadIdByRoomId(roomId).orElse(null);
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
     * 스레드 ID → roomId 매핑 확인 (DiscordMessageListener에서 사용)
     */
    public String getRoomIdByThread(String threadId) {
        if (threadId == null || threadId.isBlank()) {
            return null;
        }

        String cachedRoomId = threadToRoom.get(threadId);
        if (cachedRoomId != null) {
            return cachedRoomId;
        }

        Optional<ChatDiscordThreadLink> savedLink = linkRepository.findByThreadId(threadId);
        if (savedLink.isPresent()) {
            ChatDiscordThreadLink link = savedLink.get();
            cacheLink(link.getRoomId(), link.getThreadId());
            return link.getRoomId();
        }

        if (jda == null) {
            return null;
        }

        ThreadChannel thread = jda.getThreadChannelById(threadId);
        if (thread == null) {
            return null;
        }

        return restoreRoomIdFromThreadName(thread)
                .map(roomId -> {
                    log.info("Discord 스레드 매핑 복구: thread={} -> room={}", threadId, roomId);
                    return roomId;
                })
                .orElse(null);
    }

    private ThreadChannel resolveThreadForRoom(TextChannel channel, String roomId, String username) {
        String threadId = findThreadIdByRoomId(roomId).orElse(null);
        ThreadChannel thread = threadId != null ? jda.getThreadChannelById(threadId) : null;

        if (thread != null && !thread.isArchived()) {
            return thread;
        }

        ThreadChannel recoveredThread = channel.getThreadChannels().stream()
                .filter(candidate -> !candidate.isArchived())
                .filter(candidate -> username.equals(extractVisitorName(candidate.getName())))
                .findFirst()
                .orElse(null);
        if (recoveredThread != null) {
            persistLink(roomId, recoveredThread.getId(), username);
            return recoveredThread;
        }

        String threadName = String.format(
                "💬 %s (%s)",
                username,
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("MM/dd HH:mm"))
        );

        ThreadChannel createdThread = channel.createThreadChannel(threadName, false)
                .setAutoArchiveDuration(ThreadChannel.AutoArchiveDuration.TIME_24_HOURS)
                .complete();

        persistLink(roomId, createdThread.getId(), username);

        createdThread.sendMessageEmbeds(new EmbedBuilder()
                .setTitle("새 채팅 시작")
                .setDescription("**" + username + "** 님이 블로그에서 채팅을 시작했습니다.\n이 스레드에서 답장하면 방문자에게 전달됩니다.")
                .setFooter("roomId: " + roomId)
                .setColor(new Color(30, 41, 59))
                .build()
        ).queue();

        return createdThread;
    }

    private Optional<String> findThreadIdByRoomId(String roomId) {
        if (roomId == null || roomId.isBlank()) {
            return Optional.empty();
        }

        String cachedThreadId = roomToThread.get(roomId);
        if (cachedThreadId != null) {
            return Optional.of(cachedThreadId);
        }

        return linkRepository.findByRoomId(roomId)
                .map(link -> {
                    cacheLink(link.getRoomId(), link.getThreadId());
                    return link.getThreadId();
                });
    }

    private Optional<String> restoreRoomIdFromThreadName(ThreadChannel thread) {
        String visitorName = extractVisitorName(thread.getName());
        if (visitorName.isBlank()) {
            return Optional.empty();
        }

        List<User> candidates = userRepository.findAllOrderByCreatedAtDesc().stream()
                .filter(user -> matchesVisitorName(user, visitorName))
                .toList();

        if (candidates.size() != 1) {
            log.warn(
                    "Discord 스레드에서 방문자 이름으로 roomId 복구 실패: name={}, candidates={}",
                    visitorName,
                    candidates.size()
            );
            return Optional.empty();
        }

        User user = candidates.getFirst();
        persistLink(user.getId(), thread.getId(), user.getDisplayName());
        return Optional.of(user.getId());
    }

    private boolean matchesVisitorName(User user, String visitorName) {
        return visitorName.equals(user.getUsername()) || visitorName.equals(user.getDisplayName());
    }

    private String extractVisitorName(String threadName) {
        if (threadName == null || threadName.isBlank()) {
            return "";
        }

        String normalized = threadName.strip();
        if (normalized.startsWith("💬 ")) {
            normalized = normalized.substring(2).strip();
        }

        int openedAt = normalized.lastIndexOf(" (");
        if (openedAt > 0) {
            normalized = normalized.substring(0, openedAt).strip();
        }

        return normalized;
    }

    private void persistLink(String roomId, String threadId, String visitorName) {
        String existingId = linkRepository.findByRoomId(roomId)
                .map(ChatDiscordThreadLink::getId)
                .or(() -> linkRepository.findByThreadId(threadId).map(ChatDiscordThreadLink::getId))
                .orElse(null);

        linkRepository.save(ChatDiscordThreadLink.builder()
                .id(existingId)
                .roomId(roomId)
                .threadId(threadId)
                .visitorName(visitorName)
                .build());
        cacheLink(roomId, threadId);
    }

    private void cacheLink(String roomId, String threadId) {
        roomToThread.put(roomId, threadId);
        threadToRoom.put(threadId, roomId);
    }

    // 콜백 인터페이스 (ChatWebSocketHandler가 등록)
    public interface BlogMessageCallback {
        void onAdminMessage(String roomId, String adminName, String content);
    }

    private BlogMessageCallback blogMessageCallback;

    public void setBlogMessageCallback(BlogMessageCallback callback) {
        this.blogMessageCallback = callback;
    }

    public BlogMessageCallback getBlogMessageCallback() {
        return blogMessageCallback;
    }
}
