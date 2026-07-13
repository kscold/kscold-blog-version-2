package com.kscold.blog.payment.application.dto;

public record PaymentConfigResponse(
        boolean configured,
        String storeId,
        String channelKey,
        String productName,
        String orderName,
        int totalAmount,
        String currency,
        String servicePeriod) {}
