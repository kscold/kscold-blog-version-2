package com.kscold.blog.notification.domain.port.out;

import com.kscold.blog.notification.domain.model.MailMessage;

/** 도메인별로 작성한 이메일을 실제 메일 채널로 전달하는 공용 아웃바운드 포트. */
public interface MailSender {

    boolean isAvailable();

    void send(MailMessage message);
}
