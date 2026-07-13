package com.kscold.blog.payment.adapter.in.web;

import com.kscold.blog.payment.application.dto.command.CompletePaymentCommand;
import com.kscold.blog.payment.application.dto.command.PreparePaymentCommand;
import com.kscold.blog.payment.application.dto.response.CompletePaymentResponse;
import com.kscold.blog.payment.application.dto.response.PaymentConfigResponse;
import com.kscold.blog.payment.application.dto.response.PreparePaymentResponse;
import com.kscold.blog.payment.application.port.in.PaymentUseCase;
import com.kscold.blog.shared.web.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/payments/ai-agent-bloom")
public class AiAgentBloomPaymentController {

    private final PaymentUseCase paymentUseCase;

    @GetMapping("/config")
    public ResponseEntity<ApiResponse<PaymentConfigResponse>> getConfig() {
        return ResponseEntity.ok(ApiResponse.success(paymentUseCase.getConfig()));
    }

    @PostMapping("/prepare")
    public ResponseEntity<ApiResponse<PreparePaymentResponse>> prepare(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody PreparePaymentCommand request) {
        return ResponseEntity.ok(ApiResponse.success(paymentUseCase.prepare(userId, request)));
    }

    @PostMapping("/complete")
    public ResponseEntity<ApiResponse<CompletePaymentResponse>> complete(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody CompletePaymentCommand request) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        paymentUseCase.complete(
                                userId, request.getPaymentId(), request.getPaymentAccessToken())));
    }
}
