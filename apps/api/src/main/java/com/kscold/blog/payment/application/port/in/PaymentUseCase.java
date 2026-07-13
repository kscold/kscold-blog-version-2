package com.kscold.blog.payment.application.port.in;

import com.kscold.blog.payment.application.dto.command.PreparePaymentCommand;
import com.kscold.blog.payment.application.dto.response.CompletePaymentResponse;
import com.kscold.blog.payment.application.dto.response.PaymentConfigResponse;
import com.kscold.blog.payment.application.dto.response.PreparePaymentResponse;

/** AI Agent Bloom 참가권 결제 유스케이스 (driving 포트) */
public interface PaymentUseCase {

    PaymentConfigResponse getConfig();

    PreparePaymentResponse prepare(String userId, PreparePaymentCommand request);

    CompletePaymentResponse complete(String userId, String paymentId, String paymentAccessToken);
}
