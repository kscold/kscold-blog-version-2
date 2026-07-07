package com.kscold.blog.payment;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AiAgentBloomPaymentDtos {

    private AiAgentBloomPaymentDtos() {}

    public record PaymentConfigResponse(
            boolean configured,
            String storeId,
            String channelKey,
            String productName,
            String orderName,
            int totalAmount,
            String currency,
            String servicePeriod) {}

    public record PreparePaymentRequest(
            @NotBlank(message = "주문자명을 입력해주세요.")
                    @Size(min = 2, max = 40, message = "주문자명은 2~40자로 입력해주세요.")
                    String customerName,
            @NotBlank(message = "이메일을 입력해주세요.")
                    @Email(message = "올바른 이메일 형식으로 입력해주세요.")
                    @Size(max = 120, message = "이메일은 120자 이하로 입력해주세요.")
                    String customerEmail,
            @NotBlank(message = "연락처를 입력해주세요.")
                    @Pattern(
                            regexp = "^010-\\d{4}-\\d{4}$",
                            message = "연락처는 010-0000-0000 형식으로 입력해주세요.")
                    String customerPhone,
            @Size(max = 120, message = "결제 링크 토큰은 120자 이하로 입력해주세요.")
                    @Pattern(regexp = "^[A-Za-z0-9._-]*$", message = "결제 링크 토큰 형식이 올바르지 않습니다.")
                    String paymentAccessToken) {}

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

    public record CompletePaymentRequest(
            @NotBlank(message = "결제 ID가 필요합니다.") String paymentId,
            @Size(max = 120, message = "결제 링크 토큰은 120자 이하로 입력해주세요.")
                    @Pattern(regexp = "^[A-Za-z0-9._-]*$", message = "결제 링크 토큰 형식이 올바르지 않습니다.")
                    String paymentAccessToken) {}

    public record CompletePaymentResponse(
            String paymentId, PaymentOrderStatus status, String portOneStatus, String message) {}
}
