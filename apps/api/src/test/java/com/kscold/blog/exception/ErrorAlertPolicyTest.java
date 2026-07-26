package com.kscold.blog.exception;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.EOFException;
import org.junit.jupiter.api.Test;

class ErrorAlertPolicyTest {

    @Test
    void 클라이언트가_응답을_끊은_예외는_알림에서_제외한다() {
        Exception exception =
                new IllegalStateException("응답 전송 실패", new EOFException("Broken pipe"));

        boolean shouldNotify = ErrorAlertPolicy.shouldNotify(exception);

        assertThat(shouldNotify).isFalse();
    }

    @Test
    void 실제_서버_오류는_알림으로_보낸다() {
        Exception exception = new IllegalStateException("MongoDB 연결에 실패했습니다.");

        boolean shouldNotify = ErrorAlertPolicy.shouldNotify(exception);

        assertThat(shouldNotify).isTrue();
    }
}
