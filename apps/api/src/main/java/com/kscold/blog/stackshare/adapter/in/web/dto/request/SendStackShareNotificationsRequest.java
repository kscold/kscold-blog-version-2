package com.kscold.blog.stackshare.adapter.in.web.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SendStackShareNotificationsRequest {

    @NotBlank private String toolName;
    @NotBlank private String billingPeriod;
    @Positive private long totalAmount;

    /** 입금 기한 표기(예 "9월 5일"). 비워 보내면 알림톡에 "협의" 로 나간다. */
    @Size(max = 30)
    private String dueDate;

    /** 결제한 본인도 분담 인원에 넣을지 여부. 넣으면 (받는 사람 + 1)로 나누고 본인에게는 알림톡을 보내지 않는다. */
    private boolean includeOwner;

    @Valid
    @NotEmpty
    @Size(max = 100)
    private List<RecipientRequest> recipients;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class RecipientRequest {
        @NotBlank private String name;
        @NotBlank private String phoneNumber;
        private String email;
    }
}
