package com.kscold.blog.adminnight.domain.port.out;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.notification.domain.model.MailMessage;

/** Admin Night 신청 상태 변경 메일을 조립한다. */
public interface AdminNightRequestMailComposer {

    MailMessage buildRequestConfirmation(AdminNightRequest request);

    MailMessage buildRequestNotification(AdminNightRequest request, String adminEmail);

    MailMessage buildApprovedForRequester(AdminNightRequest request);

    MailMessage buildInfoRequestedForRequester(AdminNightRequest request);

    MailMessage buildApprovedForAdmin(AdminNightRequest request, String adminEmail);

    MailMessage buildResubmittedConfirmation(AdminNightRequest request);

    MailMessage buildResubmittedNotification(AdminNightRequest request, String adminEmail);

    MailMessage buildRejectedForRequester(AdminNightRequest request);
}
