package com.kscold.blog.chat.adapter.out.ratelimit;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.kscold.blog.chat.domain.port.out.ChatRateLimitPort;
import com.kscold.blog.exception.RateLimitExceededException;
import java.time.Duration;
import java.util.ArrayDeque;
import org.springframework.stereotype.Component;

@Component
public class InMemoryChatRateLimitAdapter implements ChatRateLimitPort {

    private static final String VISITOR_LIMIT_MESSAGE = "채팅 메시지를 너무 빠르게 보내고 있습니다. 잠시 후 다시 시도해주세요.";
    private static final String SYSTEM_EVENT_LIMIT_MESSAGE = "채팅 접속 이벤트 요청이 너무 많습니다.";

    private final Cache<String, RequestWindow> visitorMessageWindows;
    private final Cache<String, RequestWindow> systemEventWindows;
    private final int visitorMessageLimit;
    private final int systemEventLimit;
    private final long windowNanos;

    public InMemoryChatRateLimitAdapter(ChatRateLimitProperties properties) {
        Duration window = requirePositiveWindow(properties.getWindow());
        Duration entryTtl = window.multipliedBy(2);
        this.visitorMessageLimit = properties.getVisitorMessages();
        this.systemEventLimit = properties.getSystemEvents();
        this.windowNanos = window.toNanos();
        this.visitorMessageWindows = newCache(properties.getMaxTrackedRooms(), entryTtl);
        this.systemEventWindows = newCache(properties.getMaxTrackedRooms(), entryTtl);
    }

    @Override
    public void checkVisitorMessageAllowed(String roomId) {
        checkAllowed(visitorMessageWindows, roomId, visitorMessageLimit, VISITOR_LIMIT_MESSAGE);
    }

    @Override
    public void checkSystemEventAllowed(String roomId) {
        checkAllowed(systemEventWindows, roomId, systemEventLimit, SYSTEM_EVENT_LIMIT_MESSAGE);
    }

    private void checkAllowed(
            Cache<String, RequestWindow> windows, String roomId, int limit, String errorMessage) {
        if (roomId == null || roomId.isBlank()) {
            throw new RateLimitExceededException(errorMessage);
        }

        RequestWindow requestWindow = windows.get(roomId, ignored -> new RequestWindow());
        if (!requestWindow.tryAcquire(System.nanoTime(), windowNanos, limit)) {
            throw new RateLimitExceededException(errorMessage);
        }
    }

    private static Cache<String, RequestWindow> newCache(long maximumSize, Duration entryTtl) {
        return Caffeine.newBuilder().maximumSize(maximumSize).expireAfterAccess(entryTtl).build();
    }

    private static Duration requirePositiveWindow(Duration window) {
        if (window == null || window.isZero() || window.isNegative()) {
            throw new IllegalArgumentException("chat.rate-limit.window must be positive");
        }
        return window;
    }

    private static final class RequestWindow {
        private final ArrayDeque<Long> requests = new ArrayDeque<>();

        private synchronized boolean tryAcquire(long nowNanos, long durationNanos, int limit) {
            long cutoff = nowNanos - durationNanos;
            while (!requests.isEmpty() && requests.peekFirst() <= cutoff) {
                requests.removeFirst();
            }
            if (requests.size() >= limit) {
                return false;
            }
            requests.addLast(nowNanos);
            return true;
        }
    }
}
