package com.kscold.blog.stackshare.adapter.out.external;

import com.fasterxml.jackson.databind.JsonNode;
import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.stackshare.config.SolapiProperties;
import com.kscold.blog.stackshare.domain.model.StackShareMessage;
import com.kscold.blog.stackshare.domain.model.StackShareSendResult;
import com.kscold.blog.stackshare.domain.port.out.StackShareNotificationSender;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Slf4j
@Component
@RequiredArgsConstructor
public class SolapiStackShareNotificationAdapter implements StackShareNotificationSender {

    private final SolapiProperties properties;
    private final SolapiAuthenticationHeaderFactory authenticationHeaderFactory;
    private final RestClient.Builder restClientBuilder;

    @Override
    public StackShareSendResult send(List<StackShareMessage> messages) {
        if (!properties.isConfigured()) {
            throw new BusinessException(
                    ErrorCode.EXTERNAL_API_ERROR, "SOLAPI 알림톡 발송 설정이 완료되지 않았습니다.");
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
                            .post()
                            .uri("/messages/v4/send-many/detail")
                            .body(
                                    Map.of(
                                            "messages",
                                            messages.stream().map(this::toPayload).toList()))
                            .retrieve()
                            .body(JsonNode.class);
            return toResult(response, messages.size());
        } catch (RestClientResponseException exception) {
            log.warn(
                    "SOLAPI 알림톡 발송 실패: status={}, type={}",
                    exception.getStatusCode(),
                    exception.getClass().getSimpleName());
            throw new BusinessException(ErrorCode.EXTERNAL_API_ERROR, "알림톡 발송 요청에 실패했습니다.");
        } catch (BusinessException exception) {
            throw exception;
        } catch (Exception exception) {
            log.warn("SOLAPI 알림톡 발송 중 예외 발생: type={}", exception.getClass().getSimpleName());
            throw new BusinessException(ErrorCode.EXTERNAL_API_ERROR, "알림톡 발송 중 오류가 발생했습니다.");
        }
    }

    private Map<String, Object> toPayload(StackShareMessage message) {
        Map<String, Object> kakaoOptions =
                Map.of(
                        "pfId", properties.getKakaoPfId(),
                        "templateId", message.templateId(),
                        "variables", message.variables(),
                        "disableSms", true);
        return Map.of(
                "to",
                message.phoneNumber(),
                "from",
                properties.getSenderPhone(),
                "type",
                "ATA",
                "kakaoOptions",
                kakaoOptions);
    }

    private StackShareSendResult toResult(JsonNode response, int requestedCount) {
        if (response == null) {
            throw new BusinessException(ErrorCode.EXTERNAL_API_ERROR, "SOLAPI 응답이 비어 있습니다.");
        }
        String groupId = response.path("groupInfo").path("groupId").asText("");
        int failedCount = response.path("failedMessageList").size();
        return new StackShareSendResult(groupId, requestedCount, requestedCount - failedCount);
    }
}
