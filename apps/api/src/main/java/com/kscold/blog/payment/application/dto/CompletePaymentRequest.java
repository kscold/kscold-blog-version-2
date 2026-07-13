package com.kscold.blog.payment.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CompletePaymentRequest(
        @NotBlank(message = "결제 ID가 필요합니다.") String paymentId,
        @Size(max = 120, message = "결제 링크 토큰은 120자 이하로 입력해주세요.")
                @Pattern(regexp = "^[A-Za-z0-9._-]*$", message = "결제 링크 토큰 형식이 올바르지 않습니다.")
                String paymentAccessToken) {}
