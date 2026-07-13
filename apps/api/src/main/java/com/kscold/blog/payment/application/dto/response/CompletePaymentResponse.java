package com.kscold.blog.payment.application.dto.response;

import com.kscold.blog.payment.domain.model.PaymentOrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class CompletePaymentResponse {

    private String paymentId;

    private PaymentOrderStatus status;

    private String portOneStatus;

    private String message;
}
