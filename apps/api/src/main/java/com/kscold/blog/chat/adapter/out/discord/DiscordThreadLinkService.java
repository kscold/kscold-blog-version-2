package com.kscold.blog.chat.adapter.out.discord;

import com.kscold.blog.chat.domain.model.ChatDiscordThreadLink;
import com.kscold.blog.chat.domain.port.out.ChatDiscordThreadLinkRepository;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import lombok.extern.slf4j.Slf4j;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.entities.channel.concrete.ThreadChannel;
import org.springframework.lang.Nullable;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
final class DiscordThreadLinkService {

    private final ConcurrentHashMap<String, String> roomToThread = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> threadToRoom = new ConcurrentHashMap<>();
    private final ChatDiscordThreadLinkRepository linkRepository;
    private final UserRepository userRepository;

    DiscordThreadLinkService(
            ChatDiscordThreadLinkRepository linkRepository,
            UserRepository userRepository
    ) {
        this.linkRepository = linkRepository;
        this.userRepository = userRepository;
    }

    Optional<String> findThreadIdByRoomId(String roomId) {
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

    @Nullable
    String getRoomIdByThread(String threadId, @Nullable JDA jda) {
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

    void persistLink(String roomId, String threadId, String visitorName) {
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

    String extractVisitorName(String threadName) {
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

    private void cacheLink(String roomId, String threadId) {
        roomToThread.put(roomId, threadId);
        threadToRoom.put(threadId, roomId);
    }
}
