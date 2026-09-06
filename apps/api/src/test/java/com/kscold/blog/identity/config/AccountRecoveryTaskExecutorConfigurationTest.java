package com.kscold.blog.identity.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;
import org.junit.jupiter.api.Test;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

class AccountRecoveryTaskExecutorConfigurationTest {

    @Test
    void configuresSmallFixedBoundedExecutorWithAbortPolicy() {
        AccountRecoveryTaskExecutorConfiguration configuration =
                new AccountRecoveryTaskExecutorConfiguration();
        Executor configuredExecutor = configuration.accountRecoveryExecutor();
        assertThat(configuredExecutor).isInstanceOf(ThreadPoolTaskExecutor.class);
        ThreadPoolTaskExecutor executor = (ThreadPoolTaskExecutor) configuredExecutor;

        try {
            assertThat(executor.getCorePoolSize()).isEqualTo(2);
            assertThat(executor.getMaxPoolSize()).isEqualTo(2);
            assertThat(executor.getThreadPoolExecutor().getQueue().remainingCapacity())
                    .isEqualTo(32);
            assertThat(executor.getThreadPoolExecutor().getRejectedExecutionHandler())
                    .isInstanceOf(ThreadPoolExecutor.AbortPolicy.class);
        } finally {
            executor.shutdown();
        }
    }
}
