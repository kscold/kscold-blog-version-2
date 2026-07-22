package com.kscold.blog.notification.adapter.out.discord;

import com.kscold.blog.notification.domain.model.NotificationMessage;
import com.kscold.blog.notification.domain.port.out.NotificationSenderPort;
import java.util.ArrayList;
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

    /** 임베드 좌측 색상(청록) */
    private static final int EMBED_COLOR = 0x06B6D4;

    private final DiscordWebhookProvisioner provisioner;
    private final RestClient restClient;

    public DiscordWebhookSender(
            DiscordWebhookProvisioner provisioner, RestClient.Builder restClientBuilder) {
        this.provisioner = provisioner;
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
                        EMBED_COLOR,
                        "fields",
                        fields);

        return Map.of("embeds", List.of(embed));
    }
}
