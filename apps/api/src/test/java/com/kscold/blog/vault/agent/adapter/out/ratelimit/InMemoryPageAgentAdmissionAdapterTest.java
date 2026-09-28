package com.kscold.blog.vault.agent.adapter.out.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.kscold.blog.exception.RateLimitExceededException;
import com.kscold.blog.vault.agent.config.VaultAgentProperties;
import com.kscold.blog.vault.agent.domain.model.PageAgentStreamSession;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;

class InMemoryPageAgentAdmissionAdapterTest {

    @Test
    void capsPerClientAndResetsAfterWindow() {
        AtomicLong clock = new AtomicLong();
        var adapter = new InMemoryPageAgentAdmissionAdapter(2, 2, clock::get);
        adapter.reserve("hashed-client").close();
        adapter.reserve("hashed-client").close();
        assertThatThrownBy(() -> adapter.reserve("hashed-client"))
                .isInstanceOf(RateLimitExceededException.class);
        clock.set(Duration.ofMinutes(1).toNanos());
        adapter.reserve("hashed-client").close();
    }

    @Test
    void capsConcurrencyAndReturnsSlotOnlyOnce() {
        var adapter = new InMemoryPageAgentAdmissionAdapter(8, 1, System::nanoTime);
        PageAgentStreamSession first = adapter.reserve("first-hash");
        assertThatThrownBy(() -> adapter.reserve("second-hash"))
                .isInstanceOf(RateLimitExceededException.class);
        first.close();
        first.close();
        PageAgentStreamSession next = adapter.reserve("second-hash");
        assertThatThrownBy(() -> adapter.reserve("third-hash"))
                .isInstanceOf(RateLimitExceededException.class);
        next.close();
    }

    @Test
    void cancelsUpstreamAndReleasesPermitOnClose() {
        AtomicInteger cancelled = new AtomicInteger();
        AtomicInteger released = new AtomicInteger();
        var session = new PageAgentStreamSession(released::incrementAndGet);
        session.onCancel(cancelled::incrementAndGet);
        session.close();
        session.close();
        assertThat(cancelled).hasValue(1);
        assertThat(released).hasValue(1);
        assertThat(session.isActive()).isFalse();
    }

    @Test
    void cancellationBeforeGrpcStartsIsStillDelivered() {
        AtomicInteger cancelled = new AtomicInteger();
        var session = new PageAgentStreamSession(() -> {});
        session.close();
        session.onCancel(cancelled::incrementAndGet);
        assertThat(cancelled).hasValue(1);
    }

    @Test
    void globalLimitStillAppliesWhenClientHashesChange() {
        var adapter = new InMemoryPageAgentAdmissionAdapter(8, 2, () -> 0);
        for (int index = 0; index < 30; index++) {
            adapter.reserve("hash-" + index).close();
        }
        assertThatThrownBy(() -> adapter.reserve("another-hash"))
                .isInstanceOf(RateLimitExceededException.class);
    }

    @Test
    void defaultsToTwoHundredDailyRequestsEvenWhenMinuteWindowsReset() {
        var properties = new VaultAgentProperties();
        AtomicLong elapsed = new AtomicLong();
        var adapter =
                new InMemoryPageAgentAdmissionAdapter(
                        new InMemoryPageAgentAdmissionAdapter.Limits(
                                8, 2, properties.getPageChatDailyRequestLimit()),
                        elapsed::get,
                        Clock.fixed(Instant.parse("2026-09-28T12:00:00Z"), ZoneId.of("UTC")));
        for (int index = 0; index < 200; index++) {
            elapsed.addAndGet(Duration.ofSeconds(61).toNanos());
            adapter.reserve("hash-" + index).close();
        }
        assertThatThrownBy(() -> adapter.reserve("another-hash"))
                .isInstanceOf(RateLimitExceededException.class);
    }

    @Test
    void dailyCapResetsAtUtcMidnightAndRejectedRequestDoesNotLeakConcurrencySlot() {
        AtomicLong elapsed = new AtomicLong();
        AtomicReference<Instant> date =
                new AtomicReference<>(Instant.parse("2026-09-28T23:59:59Z"));
        var adapter =
                new InMemoryPageAgentAdmissionAdapter(
                        new InMemoryPageAgentAdmissionAdapter.Limits(8, 1, 1),
                        elapsed::get,
                        new MutableClock(date, ZoneId.of("Asia/Seoul")));
        adapter.reserve("first-hash").close();
        assertThatThrownBy(() -> adapter.reserve("second-hash"))
                .isInstanceOf(RateLimitExceededException.class);
        elapsed.set(Duration.ofSeconds(61).toNanos());
        date.set(Instant.parse("2026-09-29T00:00:00Z"));
        adapter.reserve("third-hash").close();
        assertThatThrownBy(() -> adapter.reserve("fourth-hash"))
                .isInstanceOf(RateLimitExceededException.class);
    }

    private static final class MutableClock extends Clock {
        private final AtomicReference<Instant> time;
        private final ZoneId zone;

        private MutableClock(AtomicReference<Instant> time, ZoneId zone) {
            this.time = time;
            this.zone = zone;
        }

        @Override
        public ZoneId getZone() {
            return zone;
        }

        @Override
        public Clock withZone(ZoneId nextZone) {
            return new MutableClock(time, nextZone);
        }

        @Override
        public Instant instant() {
            return time.get();
        }
    }
}
