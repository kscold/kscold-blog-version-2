package com.kscold.blog.payment.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PreparePaymentResponse {

    private String paymentId;

    private String storeId;

    private String channelKey;

    private String programKey;

    private String productName;

    private String orderName;

    private int totalAmount;

    private String currency;

    private String payMethod;

    private String easyPayProvider;

    private String servicePeriod;

    private String customerName;

    private String customerEmail;

    private String customerPhone;
}
