package com.kscold.blog.payment.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PaymentConfigResponse {

    private boolean configured;

    /** KG이니시스 신용카드 결제 사용 가능 여부. false 면 프론트에서 카드 결제 진입 버튼을 숨김. */
    private boolean cardConfigured;

    private String storeId;

    private String channelKey;

    private String productName;

    private String orderName;

    private int totalAmount;

    private String currency;

    private String servicePeriod;
}
