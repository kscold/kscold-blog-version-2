package com.kscold.blog.stackshare.domain.model;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * 정산 알림톡에 실어 보낼 입금 계좌. 계좌는 하나만 쓰므로 고정 id 한 건만 두고 갱신한다(단일 도큐먼트).
 *
 * <p>알림톡 본문에 그대로 나가는 값이라, 저장 시점에 공백을 정리해 두고 표시 문자열을 도메인이 직접 만든다.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "stack_share_account")
public class StackShareAccount {

    /** 계좌는 한 건만 유지하므로 문서 id를 고정한다. */
    public static final String SINGLETON_ID = "default";

    @Id private String id;

    private String bankName;
    private String accountNumber;
    private String accountHolder;

    /** 송금 확인·문의용 연락처. 숫자만 저장하고 표기할 때 하이픈을 넣는다. */
    private String contactPhone;

    @LastModifiedDate private LocalDateTime updatedAt;

    public boolean isConfigured() {
        return hasText(bankName)
                && hasText(accountNumber)
                && hasText(accountHolder)
                && hasText(contactPhone);
    }

    /** 알림톡 #{입금계좌} 변수에 들어갈 표기. 예) "토스뱅크 1000-1234-5678 (김승찬)" */
    public String toDisplayText() {
        if (!isConfigured()) {
            return "";
        }
        return bankName.trim() + " " + accountNumber.trim() + " (" + accountHolder.trim() + ")";
    }

    /** 알림톡 #{연락처} 변수에 들어갈 표기. 예) "010-1234-5678" */
    public String toContactText() {
        return formatPhone(contactPhone);
    }

    /** 01012345678 → 010-1234-5678. 형식을 모르는 값은 그대로 둔다. */
    private String formatPhone(String value) {
        if (!hasText(value)) {
            return "";
        }
        String digits = value.replaceAll("[^0-9]", "");
        if (digits.length() == 11) {
            return digits.substring(0, 3)
                    + "-"
                    + digits.substring(3, 7)
                    + "-"
                    + digits.substring(7);
        }
        if (digits.length() == 10) {
            return digits.substring(0, 3)
                    + "-"
                    + digits.substring(3, 6)
                    + "-"
                    + digits.substring(6);
        }
        return value.trim();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
