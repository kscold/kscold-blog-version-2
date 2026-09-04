package com.kscold.blog.notification.adapter.out.external;

import com.fasterxml.jackson.databind.JsonNode;
import com.kscold.blog.notification.domain.model.MessageDeliveryStatus;
import com.kscold.blog.notification.domain.port.out.MessageDeliveryStatusPort;
import com.kscold.blog.stackshare.adapter.out.external.SolapiAuthenticationHeaderFactory;
import com.kscold.blog.stackshare.config.SolapiProperties;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * 솔라피에 실제 도달 상태를 물어보는 어댑터.
 *
 * <p>보낸 사실은 우리 로그에 남지만 단말에 닿았는지는 통신사 결과가 돌아와야 알 수 있다. 상태 코드 4000 이 수신 완료이고, 실패하면 그 이유가 로그에 남는다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SolapiMessageDeliveryStatusAdapter implements MessageDeliveryStatusPort {

    /** 솔라피가 수신 완료로 주는 상태 코드. */
    private static final String DELIVERED_CODE = "4000";

    private final SolapiProperties properties;
    private final SolapiAuthenticationHeaderFactory authenticationHeaderFactory;
    private final RestClient.Builder restClientBuilder;

    @Override
    public List<MessageDeliveryStatus> findByGroupId(String groupId) {
        if (!hasCredentials()) {
            log.debug("SOLAPI 인증 정보가 없어 발송 상태를 조회하지 않음");
            return List.of();
        }
        try {
            JsonNode response =
                    restClientBuilder
                            .baseUrl(properties.getApiBaseUrl())
                            .defaultHeader(
                                    HttpHeaders.AUTHORIZATION,
                                    authenticationHeaderFactory.create(
                                            properties.getApiKey(), properties.getApiSecret()))
                            .build()
                            .get()
                            .uri(
                                    uriBuilder ->
                                            uriBuilder
                                                    .path("/messages/v4/list")
                                                    .queryParam("groupId", groupId)
                                                    .build(Map.of()))
                            .retrieve()
                            .body(JsonNode.class);
            return toStatuses(response, groupId);
        } catch (Exception exception) {
            log.warn("SOLAPI 발송 상태 조회 실패: type={}", exception.getClass().getSimpleName());
            return List.of();
        }
    }

    private boolean hasCredentials() {
        // 발송이 꺼져 있어도 지난 발송 이력은 볼 수 있어야 하므로 enabled 는 보지 않는다.
        return hasText(properties.getApiKey()) && hasText(properties.getApiSecret());
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private List<MessageDeliveryStatus> toStatuses(JsonNode response, String groupId) {
        List<MessageDeliveryStatus> statuses = new ArrayList<>();
        if (response == null) return statuses;

        JsonNode messageList = response.path("messageList");
        Iterator<String> ids = messageList.fieldNames();
        while (ids.hasNext()) {
            String messageId = ids.next();
            JsonNode message = messageList.path(messageId);
            statuses.add(
                    new MessageDeliveryStatus(
                            messageId,
                            groupId,
                            message.path("to").asText(""),
                            message.path("statusCode").asText(""),
                            message.path("status").asText(""),
                            DELIVERED_CODE.equals(message.path("statusCode").asText("")),
                            message.path("text").asText(""),
                            message.path("dateCreated").asText(""),
                            message.path("dateReceived").asText(""),
                            toLogLines(message.path("log"))));
        }
        return statuses;
    }

    private List<String> toLogLines(JsonNode logNode) {
        List<String> lines = new ArrayList<>();
        if (!logNode.isArray()) return lines;
        logNode.forEach(
                entry ->
                        lines.add(
                                entry.path("createAt").asText("")
                                        + " "
                                        + entry.path("message").asText("")));
        return lines;
    }
}
