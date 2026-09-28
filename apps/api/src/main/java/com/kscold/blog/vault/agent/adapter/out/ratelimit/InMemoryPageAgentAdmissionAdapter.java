package com.kscold.blog.vault.agent.adapter.out.ratelimit;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.kscold.blog.exception.RateLimitExceededException;
import com.kscold.blog.vault.agent.config.VaultAgentProperties;
import com.kscold.blog.vault.agent.domain.model.PageAgentStreamSession;
import com.kscold.blog.vault.agent.domain.port.out.PageAgentAdmissionPort;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayDeque;
import java.util.concurrent.Semaphore;
import java.util.function.LongSupplier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/** 익명 질문의 비용은 IP 해시별·전체 분당·UTC 일일 요청량과 동시 실행 수로 제한한다. */
@Component
public class InMemoryPageAgentAdmissionAdapter implements PageAgentAdmissionPort {

    private static final String LIMIT_MESSAGE = "페이지 Agent 요청이 많습니다. 잠시 후 다시 시도해주세요.";
    private final Cache<String, RequestWindow> windows =
            Caffeine.newBuilder()
                    .maximumSize(1000)
                    .expireAfterAccess(Duration.ofMinutes(2))
                    .build();
    private final Semaphore concurrent;
    private final int requestLimit;
    private final LongSupplier clock;
    private final Clock dateClock;
    private final int dailyRequestLimit;
    private final DailyWindow dailyWindow = new DailyWindow();
    private final RequestWindow globalWindow = new RequestWindow();

    @Autowired
    public InMemoryPageAgentAdmissionAdapter(VaultAgentProperties properties) {
        this(
                new Limits(8, 2, properties.getPageChatDailyRequestLimit()),
                System::nanoTime,
                Clock.systemUTC());
    }

    InMemoryPageAgentAdmissionAdapter(int requestLimit, int concurrentLimit, LongSupplier clock) {
        this(new Limits(requestLimit, concurrentLimit, 200), clock, Clock.systemUTC());
    }

    InMemoryPageAgentAdmissionAdapter(Limits limits, LongSupplier clock, Clock dateClock) {
        if (limits.perMinute() < 1
                || limits.concurrent() < 1
                || limits.perDay() < 1
                || limits.perDay() > 10000) {
            throw new IllegalArgumentException("페이지 Agent 요청 제한 설정이 유효하지 않습니다.");
        }
        this.requestLimit = limits.perMinute();
        this.concurrent = new Semaphore(limits.concurrent());
        this.clock = clock;
        this.dateClock = dateClock.withZone(ZoneOffset.UTC);
        this.dailyRequestLimit = limits.perDay();
    }

    @Override
    public PageAgentStreamSession reserve(String clientIdentifier) {
        if (clientIdentifier == null
                || clientIdentifier.isBlank()
                || clientIdentifier.length() > 128) {
            throw new RateLimitExceededException(LIMIT_MESSAGE);
        }
        RequestWindow window = windows.get(clientIdentifier, ignored -> new RequestWindow());
        long now = clock.getAsLong();
        if (!window.acquire(now, requestLimit)
                || !globalWindow.acquire(now, 30)
                || !concurrent.tryAcquire()) {
            throw new RateLimitExceededException(LIMIT_MESSAGE);
        }
        if (!dailyWindow.acquire(LocalDate.now(dateClock), dailyRequestLimit)) {
            concurrent.release();
            throw new RateLimitExceededException(LIMIT_MESSAGE);
        }
        return new PageAgentStreamSession(concurrent::release);
    }

    record Limits(int perMinute, int concurrent, int perDay) {}

    private static final class DailyWindow {
        private LocalDate day;
        private int requests;

        private synchronized boolean acquire(LocalDate now, int limit) {
            if (day == null || now.isAfter(day)) {
                day = now;
                requests = 0;
            }
            if (requests >= limit) {
                return false;
            }
            requests++;
            return true;
        }
    }

    private static final class RequestWindow {
        private final ArrayDeque<Long> requests = new ArrayDeque<>();

        private synchronized boolean acquire(long now, int limit) {
            long cutoff = now - Duration.ofMinutes(1).toNanos();
            while (!requests.isEmpty() && requests.peekFirst() <= cutoff) {
                requests.removeFirst();
            }
            if (requests.size() >= limit) {
                return false;
            }
            requests.addLast(now);
            return true;
        }
    }
}
