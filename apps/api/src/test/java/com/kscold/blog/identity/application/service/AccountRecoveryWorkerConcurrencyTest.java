package com.kscold.blog.identity.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.support.UserFixtures;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AccountRecoveryWorkerConcurrencyTest {

    private UserRepository userRepository;
    private AccountRecoveryMailService recoveryMailService;
    private AccountRecoveryWorker worker;
    private ExecutorService executor;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        recoveryMailService = mock(AccountRecoveryMailService.class);
        worker = new AccountRecoveryWorker(userRepository, recoveryMailService);
        executor = Executors.newFixedThreadPool(2);
    }

    @AfterEach
    void tearDown() {
        executor.shutdownNow();
    }

    @Test
    void sameEmailRecoveryWorkflowHasMaximumConcurrencyOfOne() throws Exception {
        String email = "alpha@example.com";
        User user = UserFixtures.user("user-1", User.Role.USER, "alpha", "사용자");
        when(userRepository.findActiveByEmail(email)).thenReturn(Optional.of(user));
        SerialDeliveryProbe probe = new SerialDeliveryProbe();
        blockFirstDelivery(probe);
        StartGate startGate = new StartGate();
        Future<?> first = submit(email, startGate);
        Future<?> second = submit(email, startGate);

        try {
            startGate.releaseTogether();
            probe.assertOnlyFirstEntered();
            assertThat(probe.maximumConcurrency).hasValue(1);
            probe.releaseFirstDelivery();
            await(first, second);
            verify(recoveryMailService, times(2)).send(AccountRecoveryAction.PASSWORD_RESET, user);
        } finally {
            probe.releaseFirstDelivery();
            cancel(first, second);
        }
    }

    @Test
    void differentEmailRecoveryWorkflowsCanRunInParallel() throws Exception {
        User alpha = UserFixtures.user("user-1", User.Role.USER, "alpha", "첫 사용자");
        User beta = UserFixtures.user("user-2", User.Role.USER, "beta", "둘째 사용자");
        when(userRepository.findActiveByEmail(alpha.getEmail())).thenReturn(Optional.of(alpha));
        when(userRepository.findActiveByEmail(beta.getEmail())).thenReturn(Optional.of(beta));
        ParallelDeliveryProbe probe = new ParallelDeliveryProbe();
        blockBothDeliveries(probe);
        StartGate startGate = new StartGate();
        Future<?> first = submit(alpha.getEmail(), startGate);
        Future<?> second = submit(beta.getEmail(), startGate);

        try {
            startGate.releaseTogether();
            probe.assertBothEntered();
            assertThat(probe.maximumConcurrency).hasValue(2);
            probe.releaseDeliveries();
            await(first, second);
        } finally {
            probe.releaseDeliveries();
            cancel(first, second);
        }
    }

    private void blockFirstDelivery(SerialDeliveryProbe probe) {
        doAnswer(
                        invocation -> {
                            probe.recordDelivery();
                            return null;
                        })
                .when(recoveryMailService)
                .send(any(AccountRecoveryAction.class), any(User.class));
    }

    private void blockBothDeliveries(ParallelDeliveryProbe probe) {
        doAnswer(
                        invocation -> {
                            probe.recordDelivery();
                            return null;
                        })
                .when(recoveryMailService)
                .send(any(AccountRecoveryAction.class), any(User.class));
    }

    private Future<?> submit(String email, StartGate startGate) {
        return executor.submit(
                () -> {
                    startGate.awaitStart();
                    worker.process(AccountRecoveryAction.PASSWORD_RESET, email);
                    return null;
                });
    }

    private void await(Future<?> first, Future<?> second) throws Exception {
        first.get(1, TimeUnit.SECONDS);
        second.get(1, TimeUnit.SECONDS);
    }

    private void cancel(Future<?> first, Future<?> second) {
        if (!first.isDone()) first.cancel(true);
        if (!second.isDone()) second.cancel(true);
    }

    private static final class StartGate {

        private final CountDownLatch ready = new CountDownLatch(2);
        private final CountDownLatch start = new CountDownLatch(1);

        void awaitStart() throws InterruptedException {
            ready.countDown();
            start.await(1, TimeUnit.SECONDS);
        }

        void releaseTogether() throws InterruptedException {
            assertThat(ready.await(1, TimeUnit.SECONDS)).isTrue();
            start.countDown();
        }
    }

    private static final class SerialDeliveryProbe {

        private final CountDownLatch firstEntered = new CountDownLatch(1);
        private final CountDownLatch secondEntered = new CountDownLatch(1);
        private final CountDownLatch release = new CountDownLatch(1);
        private final AtomicInteger activeDeliveries = new AtomicInteger();
        private final AtomicInteger maximumConcurrency = new AtomicInteger();
        private final AtomicInteger sequence = new AtomicInteger();

        void recordDelivery() throws InterruptedException {
            int current = activeDeliveries.incrementAndGet();
            maximumConcurrency.accumulateAndGet(current, Math::max);
            try {
                if (sequence.incrementAndGet() == 1) {
                    firstEntered.countDown();
                    release.await(2, TimeUnit.SECONDS);
                } else {
                    secondEntered.countDown();
                }
            } finally {
                activeDeliveries.decrementAndGet();
            }
        }

        void assertOnlyFirstEntered() throws InterruptedException {
            assertThat(firstEntered.await(1, TimeUnit.SECONDS)).isTrue();
            assertThat(secondEntered.await(200, TimeUnit.MILLISECONDS)).isFalse();
        }

        void releaseFirstDelivery() {
            release.countDown();
        }
    }

    private static final class ParallelDeliveryProbe {

        private final CountDownLatch bothEntered = new CountDownLatch(2);
        private final CountDownLatch release = new CountDownLatch(1);
        private final AtomicInteger activeDeliveries = new AtomicInteger();
        private final AtomicInteger maximumConcurrency = new AtomicInteger();

        void recordDelivery() throws InterruptedException {
            int current = activeDeliveries.incrementAndGet();
            maximumConcurrency.accumulateAndGet(current, Math::max);
            bothEntered.countDown();
            try {
                release.await(2, TimeUnit.SECONDS);
            } finally {
                activeDeliveries.decrementAndGet();
            }
        }

        void assertBothEntered() throws InterruptedException {
            assertThat(bothEntered.await(1, TimeUnit.SECONDS)).isTrue();
        }

        void releaseDeliveries() {
            release.countDown();
        }
    }
}
