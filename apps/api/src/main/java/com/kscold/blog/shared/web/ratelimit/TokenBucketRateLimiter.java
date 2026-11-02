package com.kscold.blog.shared.web.ratelimit;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.time.Duration;
import java.util.function.LongSupplier;

/** 규칙 이름과 클라이언트마다 토큰 통을 메모리에 둔다. 서버를 다시 띄우면 비워진다. */
final class TokenBucketRateLimiter {

    private static final double NANOS_PER_MINUTE = 60_000_000_000.0;
    private static final double NANOS_PER_SECOND = 1_000_000_000.0;

    private final Cache<String, TokenBucket> buckets;
    private final LongSupplier nanoClock;

    TokenBucketRateLimiter(long maxTrackedClients, LongSupplier nanoClock) {
        this.buckets =
                Caffeine.newBuilder()
                        .maximumSize(maxTrackedClients)
                        .expireAfterAccess(Duration.ofMinutes(30))
                        .build();
        this.nanoClock = nanoClock;
    }

    /** 요청을 받아도 되면 0을, 아니면 다음 토큰이 찰 때까지 기다릴 초를 돌려준다. */
    long tryAcquire(String key, ApiRateLimitPolicy policy) {
        long now = nanoClock.getAsLong();
        TokenBucket bucket = buckets.get(key, ignored -> new TokenBucket(policy.capacity(), now));
        return bucket.tryAcquire(policy, now);
    }

    private static final class TokenBucket {
        private double tokens;
        private long updatedAt;

        private TokenBucket(int capacity, long now) {
            this.tokens = capacity;
            this.updatedAt = now;
        }

        private synchronized long tryAcquire(ApiRateLimitPolicy policy, long now) {
            double refillPerNano = policy.ratePerMinute() / NANOS_PER_MINUTE;
            tokens = Math.min(policy.capacity(), tokens + (now - updatedAt) * refillPerNano);
            updatedAt = now;
            if (tokens >= 1) {
                tokens -= 1;
                return 0;
            }
            return Math.max(1, (long) Math.ceil((1 - tokens) / refillPerNano / NANOS_PER_SECOND));
        }
    }
}
