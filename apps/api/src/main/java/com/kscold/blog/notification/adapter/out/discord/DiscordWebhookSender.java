package com.kscold.blog.notification.adapter.out.discord;

import com.kscold.blog.notification.config.NotificationProperties;
import com.kscold.blog.notification.domain.model.NotificationChannel;
import com.kscold.blog.notification.domain.model.NotificationMessage;
import com.kscold.blog.notification.domain.port.out.NotificationSenderPort;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * 디스코드 웹훅으로 단방향 알림을 보내는 어댑터.
 *
 * <p>웹훅 URL 은 {@link DiscordWebhookProvisioner} 가 채널 이름을 보고 자동으로 준비한 것을 사용한다.
 */
@Slf4j
@Component
public class DiscordWebhookSender implements NotificationSenderPort {

    /** 회원가입 알림 색상(청록) */
    private static final int SIGNUP_COLOR = 0x06B6D4;

    /** 오류 알림 색상(빨강) */
    private static final int ERROR_COLOR = 0xEF4444;

    private final DiscordWebhookProvisioner provisioner;
    private final NotificationProperties properties;
    private final RestClient restClient;

    public DiscordWebhookSender(
            DiscordWebhookProvisioner provisioner,
            NotificationProperties properties,
            RestClient.Builder restClientBuilder) {
        this.provisioner = provisioner;
        this.properties = properties;
        this.restClient = restClientBuilder.build();
    }

    @Override
    public boolean isAvailable() {
        return provisioner.hasAnyWebhook();
    }

    @Override
    public void send(NotificationMessage message) {
        String url = provisioner.webhookUrl(message.channel()).orElse(null);
        if (url == null) {
            return;
        }

        restClient
                .post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(toPayload(message))
                .retrieve()
                .toBodilessEntity();
    }

    private Map<String, Object> toPayload(NotificationMessage message) {
        List<Map<String, Object>> fields = new ArrayList<>();
        for (NotificationMessage.Field field : message.fields()) {
            fields.add(Map.of("name", field.name(), "value", field.value(), "inline", true));
        }

        Map<String, Object> embed =
                Map.of(
                        "title",
                        message.title(),
                        "description",
                        message.description(),
                        "color",
                        message.channel() == NotificationChannel.ERROR ? ERROR_COLOR : SIGNUP_COLOR,
                        "fields",
                        fields);

        // 웹훅은 메시지마다 표시 이름·아바타를 바꿀 수 있어, 채널마다 다른 봇처럼 보이게 한다.
        // (채팅 브릿지 봇 이름으로 뜨지 않도록 하는 것이 목적)
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("username", properties.botName(message.channel()));
        String avatarUrl = properties.botAvatarUrl(message.channel());
        if (avatarUrl != null) {
            payload.put("avatar_url", avatarUrl);
        }
        payload.put("embeds", List.of(embed));
        return payload;
    }
}
