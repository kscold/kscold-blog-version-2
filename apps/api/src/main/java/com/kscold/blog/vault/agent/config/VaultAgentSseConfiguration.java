package com.kscold.blog.vault.agent.config;

import java.util.concurrent.Executor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
public class VaultAgentSseConfiguration {

    @Bean("vaultAgentSseExecutor")
    public Executor vaultAgentSseExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(6);
        executor.setQueueCapacity(24);
        executor.setThreadNamePrefix("vault-agent-sse-");
        executor.initialize();
        return executor;
    }
}
