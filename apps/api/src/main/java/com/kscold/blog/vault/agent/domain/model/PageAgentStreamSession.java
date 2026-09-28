package com.kscold.blog.vault.agent.domain.model;

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

/** 요청 종료·연결 해제 시 비용을 발생시키는 상위 스트림과 동시 실행 슬롯을 함께 닫는다. */
public final class PageAgentStreamSession implements AutoCloseable {

    private final AtomicBoolean active = new AtomicBoolean(true);
    private final AtomicReference<Runnable> cancellation = new AtomicReference<>();
    private final Runnable release;

    public PageAgentStreamSession(Runnable release) {
        this.release = release;
    }

    public boolean isActive() {
        return active.get();
    }

    public void onCancel(Runnable handler) {
        cancellation.set(handler);
        if (!active.get()) {
            Runnable pending = cancellation.getAndSet(null);
            if (pending != null) {
                pending.run();
            }
        }
    }

    @Override
    public void close() {
        if (!active.compareAndSet(true, false)) {
            return;
        }
        try {
            Runnable handler = cancellation.getAndSet(null);
            if (handler != null) {
                handler.run();
            }
        } finally {
            release.run();
        }
    }
}
