package com.kscold.blog.vault.agent.domain.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;

class AgentStreamSessionTest {
    @Test
    void alreadyClosedSessionCancelsLateConnectionExactlyOnce() {
        var session = new AgentStreamSession();
        var cancelled = new AtomicInteger();
        session.close();
        session.onCancel(cancelled::incrementAndGet);
        session.close();
        assertThat(session.isActive()).isFalse();
        assertThat(cancelled.get()).isEqualTo(1);
    }
}
