package com.kscold.blog.notification.adapter.out.discord;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.dv8tion.jda.api.JDA;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * 애플리케이션 기동 후 알림 채널·웹훅을 준비함.
 *
 * <p>JDA 는 로그인이 비동기라 준비가 끝나야 길드 정보를 읽을 수 있다. 기동 자체를 막지 않도록 별도 가상 스레드에서 대기한 뒤 프로비저닝한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DiscordWebhookInitializer {

    private final ObjectProvider<JDA> jdaProvider;
    private final DiscordWebhookProvisioner provisioner;

    @EventListener(ApplicationReadyEvent.class)
    public void initialize() {
        JDA jda = jdaProvider.getIfAvailable();
        if (jda == null) {
            return;
        }

        Thread.ofVirtual()
                .start(
                        () -> {
                            try {
                                jda.awaitReady();
                                provisioner.provisionAll();
                            } catch (InterruptedException exception) {
                                Thread.currentThread().interrupt();
                            } catch (IllegalStateException exception) {
                                // 재배포로 JDA 가 먼저 종료된 경우 — 정상 흐름
                                log.info("알림 채널 준비 중 종료됨: {}", exception.getMessage());
                            } catch (Exception exception) {
                                log.warn("알림 채널 준비 실패", exception);
                            }
                        });
    }
}
