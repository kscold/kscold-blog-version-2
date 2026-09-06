package com.kscold.blog.identity.config;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/** 계정 복구 조회와 메일 전송을 HTTP 요청에서 분리하는 bounded 실행기 설정. */
@Configuration
public class AccountRecoveryTaskExecutorConfiguration {

    @Bean("accountRecoveryExecutor")
    public Executor accountRecoveryExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(2);
        executor.setQueueCapacity(32);
        executor.setKeepAliveSeconds(30);
        executor.setThreadNamePrefix("account-recovery-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(10);
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.AbortPolicy());
        executor.initialize();
        return executor;
    }
}
