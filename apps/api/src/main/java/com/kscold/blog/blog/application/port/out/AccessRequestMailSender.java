package com.kscold.blog.blog.application.port.out;

import com.kscold.blog.blog.domain.model.AccessRequest;

public interface AccessRequestMailSender {

    boolean isAvailable();

    /** 승인 완료 알림 메일 */
    void sendApproved(String toEmail, String displayName, AccessRequest request);
}
