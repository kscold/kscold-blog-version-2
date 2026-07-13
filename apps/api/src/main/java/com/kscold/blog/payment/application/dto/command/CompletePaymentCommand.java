package com.kscold.blog.payment.application.dto.command;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class CompletePaymentCommand {

    @NotBlank(message = "결제 ID가 필요합니다.")
    private String paymentId;

    @Size(max = 120, message = "결제 링크 토큰은 120자 이하로 입력해주세요.")
    @Pattern(regexp = "^[A-Za-z0-9._-]*$", message = "결제 링크 토큰 형식이 올바르지 않습니다.")
    private String paymentAccessToken;
}
