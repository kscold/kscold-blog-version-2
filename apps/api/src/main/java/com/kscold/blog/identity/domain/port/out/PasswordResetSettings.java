package com.kscold.blog.identity.domain.port.out;

/** 비밀번호 재설정 정책 중 배포 환경에서 조정할 수 있는 값. */
public interface PasswordResetSettings {

    long getPasswordResetExpiryMinutes();
}
