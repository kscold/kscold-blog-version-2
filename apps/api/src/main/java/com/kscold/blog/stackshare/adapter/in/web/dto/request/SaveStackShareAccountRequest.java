package com.kscold.blog.stackshare.adapter.in.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SaveStackShareAccountRequest {

    @NotBlank
    @Size(max = 30)
    private String bankName;

    @NotBlank
    @Size(max = 40)
    private String accountNumber;

    @NotBlank
    @Size(max = 30)
    private String accountHolder;

    /** 송금 확인·문의용 휴대전화 번호. 알림톡 #{연락처} 로 나간다. */
    @NotBlank
    @Size(max = 20)
    private String contactPhone;
}
