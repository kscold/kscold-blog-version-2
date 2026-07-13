package com.kscold.blog.payment.application.dto;

public record PreparePaymentResponse(
        String paymentId,
        String storeId,
        String channelKey,
        String programKey,
        String productName,
        String orderName,
        int totalAmount,
        String currency,
        String payMethod,
        String easyPayProvider,
        String servicePeriod,
        String customerName,
        String customerEmail,
        String customerPhone) {}
