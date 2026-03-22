package com.kscold.blog.chat.adapter.out.discord;

import lombok.extern.slf4j.Slf4j;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.requests.GatewayIntent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@ConditionalOnProperty(name = "discord.token", matchIfMissing = false)
public class DiscordBotConfig {

    @Value("${discord.token}")
    private String token;

    @Bean
    public JDA jda(@org.springframework.context.annotation.Lazy DiscordMessageListener messageListener) throws InterruptedException {
        if (token == null || token.isBlank()) {
            log.warn("Discord 봇 토큰이 설정되지 않아 비활성화됩니다");
            return null;
        }

        JDA jda = JDABuilder.createDefault(token)
                .enableIntents(
                        GatewayIntent.GUILD_MESSAGES,
                        GatewayIntent.MESSAGE_CONTENT
                )
                .addEventListeners(messageListener)
                .build();

        // awaitReady를 별도 스레드에서 실행 (Spring Boot 시작 블로킹 방지)
        Thread.ofVirtual().start(() -> {
            try {
                jda.awaitReady();
                log.info("Discord 봇 연결 완료: {}", jda.getSelfUser().getName());
            } catch (InterruptedException e) {
                log.error("Discord 봇 연결 대기 중 인터럽트", e);
                Thread.currentThread().interrupt();
            }
        });

        return jda;
    }
}
