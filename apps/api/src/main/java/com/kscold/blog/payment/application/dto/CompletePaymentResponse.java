package com.kscold.blog.payment.application.dto;

import com.kscold.blog.payment.domain.model.PaymentOrderStatus;

public record CompletePaymentResponse(
        String paymentId, PaymentOrderStatus status, String portOneStatus, String message) {}
