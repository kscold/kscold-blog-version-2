package com.kscold.blog.payment.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PaymentConfigResponse {

    private boolean configured;

    private String storeId;

    private String channelKey;

    private String productName;

    private String orderName;

    private int totalAmount;

    private String currency;

    private String servicePeriod;
}
