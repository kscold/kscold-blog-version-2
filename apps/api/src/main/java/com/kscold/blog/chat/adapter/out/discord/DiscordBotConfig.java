package com.kscold.blog.chat.adapter.out.discord;

import lombok.extern.slf4j.Slf4j;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.requests.GatewayIntent;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@ConditionalOnProperty(name = "discord.token", matchIfMissing = false)
public class DiscordBotConfig {

    @Value("${discord.token}")
    private String token;

    @Bean
    public JDA jda() {
        if (token == null || token.isBlank()) {
            log.warn("Discord 봇 토큰이 설정되지 않아 비활성화됩니다");
            return null;
        }

        JDA jda =
                JDABuilder.createDefault(token)
                        .enableIntents(GatewayIntent.GUILD_MESSAGES, GatewayIntent.MESSAGE_CONTENT)
                        .build();

        // awaitReady를 별도 스레드에서 실행 (Spring Boot 시작 블로킹 방지)
        Thread.ofVirtual()
                .start(
                        () -> {
                            try {
                                jda.awaitReady();
                                log.info("Discord 봇 연결 완료: {}", jda.getSelfUser().getName());
                            } catch (InterruptedException e) {
                                log.error("Discord 봇 연결 대기 중 인터럽트", e);
                                Thread.currentThread().interrupt();
                            } catch (IllegalStateException e) {
                                // 애플리케이션 종료(재배포)로 JDA가 먼저 shutdown된 경우 — 정상 흐름
                                log.info("Discord 봇 연결 대기 중 종료됨: {}", e.getMessage());
                            }
                        });

        return jda;
    }

    /**
     * 메시지 리스너는 컨텍스트가 완성된 뒤에 등록함.
     *
     * <p>JDABuilder에 리스너를 직접 등록하면 JDA 로그인 직후(컨텍스트 초기화 중) 이벤트가 도착했을 때 {@code JDA → listener →
     * DiscordBridgeService → JDA} 순환 프록시가 아직 생성 중인 빈을 요청해 {@code BeanCurrentlyInCreationException}이
     * 발생함. ApplicationReadyEvent 시점 등록으로 순환 자체를 제거함.
     */
    @Bean
    ApplicationListener<ApplicationReadyEvent> discordListenerRegistrar(
            ObjectProvider<JDA> jdaProvider, ObjectProvider<DiscordMessageListener> listener) {
        return event -> {
            JDA jda = jdaProvider.getIfAvailable();
            DiscordMessageListener messageListener = listener.getIfAvailable();
            if (jda == null || messageListener == null) {
                return;
            }
            jda.addEventListener(messageListener);
            log.info("Discord 메시지 리스너 등록 완료");
        };
    }
}
