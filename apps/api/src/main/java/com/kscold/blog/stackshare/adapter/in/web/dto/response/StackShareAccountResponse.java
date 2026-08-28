package com.kscold.blog.stackshare.adapter.in.web.dto.response;

import com.kscold.blog.stackshare.domain.model.StackShareAccount;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StackShareAccountResponse {

    private String bankName;
    private String accountNumber;
    private String accountHolder;
    private String contactPhone;

    /** 알림톡에 실제로 나갈 문자열. 관리자 화면에서 미리보기로 그대로 보여주기 위함. */
    private String displayText;

    /** 하이픈이 들어간 연락처 표기. 알림톡에 나갈 형태 그대로. */
    private String contactText;

    private boolean configured;

    public static StackShareAccountResponse from(StackShareAccount account) {
        return StackShareAccountResponse.builder()
                .bankName(account.getBankName())
                .accountNumber(account.getAccountNumber())
                .accountHolder(account.getAccountHolder())
                .contactPhone(account.getContactPhone())
                .displayText(account.toDisplayText())
                .contactText(account.toContactText())
                .configured(account.isConfigured())
                .build();
    }
}
