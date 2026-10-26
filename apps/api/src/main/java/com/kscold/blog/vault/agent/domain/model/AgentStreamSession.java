package com.kscold.blog.vault.agent.domain.model;

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

/** 브라우저 연결 종료를 생성 요청의 취소와 연결한다. */
public final class AgentStreamSession implements AutoCloseable {
    private final AtomicBoolean active = new AtomicBoolean(true);
    private final AtomicReference<Runnable> cancellation = new AtomicReference<>();

    public boolean isActive() {
        return active.get();
    }

    public void onCancel(Runnable handler) {
        cancellation.set(handler);
        if (!active.get()) {
            cancelPending();
        }
    }

    @Override
    public void close() {
        if (active.compareAndSet(true, false)) {
            cancelPending();
        }
    }

    private void cancelPending() {
        Runnable handler = cancellation.getAndSet(null);
        if (handler != null) {
            handler.run();
        }
    }
}
