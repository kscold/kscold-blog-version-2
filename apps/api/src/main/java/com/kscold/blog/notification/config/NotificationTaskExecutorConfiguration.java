package com.kscold.blog.notification.config;

import java.util.concurrent.Executor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/** 알림 전송을 요청 처리와 분리해 보내는 전용 작업 실행기 설정. */
@Configuration
public class NotificationTaskExecutorConfiguration {

    @Bean("notificationExecutor")
    public Executor notificationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);
        executor.setMaxPoolSize(2);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("notify-");
        // 큐가 가득 차면 요청 스레드에서 대신 보내지 않고 예외를 던져 알림만 버린다(요청 지연 방지).
        executor.setRejectedExecutionHandler(
                (runnable, pool) -> {
                    throw new java.util.concurrent.RejectedExecutionException("알림 큐가 가득 찼습니다");
                });
        executor.initialize();
        return executor;
    }
}
