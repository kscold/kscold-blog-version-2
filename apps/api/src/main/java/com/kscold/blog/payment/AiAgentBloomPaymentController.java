package com.kscold.blog.payment;

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

import static com.kscold.blog.payment.AiAgentBloomPaymentDtos.CompletePaymentRequest;
import static com.kscold.blog.payment.AiAgentBloomPaymentDtos.CompletePaymentResponse;
import static com.kscold.blog.payment.AiAgentBloomPaymentDtos.PaymentConfigResponse;
import static com.kscold.blog.payment.AiAgentBloomPaymentDtos.PreparePaymentRequest;
import static com.kscold.blog.payment.AiAgentBloomPaymentDtos.PreparePaymentResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments/ai-agent-bloom")
public class AiAgentBloomPaymentController {

    private final AiAgentBloomPaymentService aiAgentBloomPaymentService;

    @GetMapping("/config")
    public ResponseEntity<ApiResponse<PaymentConfigResponse>> getConfig() {
        return ResponseEntity.ok(ApiResponse.success(aiAgentBloomPaymentService.getConfig()));
    }

    @PostMapping("/prepare")
    public ResponseEntity<ApiResponse<PreparePaymentResponse>> prepare(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody PreparePaymentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(aiAgentBloomPaymentService.prepare(userId, request)));
    }

    @PostMapping("/complete")
    public ResponseEntity<ApiResponse<CompletePaymentResponse>> complete(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody CompletePaymentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(aiAgentBloomPaymentService.complete(
                userId,
                request.paymentId(),
                request.paymentAccessToken()
        )));
    }
}
