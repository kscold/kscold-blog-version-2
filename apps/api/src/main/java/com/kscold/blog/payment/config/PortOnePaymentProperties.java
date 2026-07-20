package com.kscold.blog.payment.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "portone")
public class PortOnePaymentProperties {

    private String storeId = "";
    private String kakaoPayChannelKey = "";
    private String inicisChannelKey = "";
    private String apiSecret = "";
    private String apiBaseUrl = "https://api.portone.io";

    public boolean isClientConfigured() {
        return hasText(storeId) && hasText(kakaoPayChannelKey);
    }

    /**
     * KG이니시스 신용카드 결제 사용 가능 여부. 채널키를 비우면 카드 결제 경로와 상품 상세의 진입 버튼이 함께 숨겨지므로, 심사 종료 후에는 이 값만 제거하면 됨.
     */
    public boolean isCardConfigured() {
        return hasText(storeId) && hasText(inicisChannelKey);
    }

    public boolean isServerConfigured() {
        return hasText(apiSecret);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
