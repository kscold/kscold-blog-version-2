package com.kscold.blog.payment.application.port.in;

import com.kscold.blog.payment.application.dto.CompletePaymentResponse;
import com.kscold.blog.payment.application.dto.PaymentConfigResponse;
import com.kscold.blog.payment.application.dto.PreparePaymentRequest;
import com.kscold.blog.payment.application.dto.PreparePaymentResponse;

/** AI Agent Bloom 참가권 결제 유스케이스 (driving 포트) */
public interface PaymentUseCase {

    PaymentConfigResponse getConfig();

    PreparePaymentResponse prepare(String userId, PreparePaymentRequest request);

    CompletePaymentResponse complete(String userId, String paymentId, String paymentAccessToken);
}
