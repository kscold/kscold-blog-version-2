package com.kscold.blog.identity.domain.port.out;

import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.notification.domain.model.MailMessage;

public interface RecoveryMailComposer {

    MailMessage buildUsernameReminder(User user);

    MailMessage buildPasswordReset(User user, String resetUrl);

    MailMessage buildWelcome(User user);

    MailMessage buildUnreadChatReminder(
            User user, String adminName, String latestContent, long unreadCount, String actionUrl);

    MailMessage buildAdminNightRequestConfirmation(AdminNightRequest request);

    MailMessage buildAdminNightRequestNotification(AdminNightRequest request, String adminEmail);

    MailMessage buildAdminNightApprovedForRequester(AdminNightRequest request);

    MailMessage buildAdminNightInfoRequestedForRequester(AdminNightRequest request);

    MailMessage buildAdminNightApprovedForAdmin(AdminNightRequest request, String adminEmail);

    MailMessage buildAdminNightResubmittedConfirmation(AdminNightRequest request);

    MailMessage buildAdminNightResubmittedNotification(
            AdminNightRequest request, String adminEmail);

    MailMessage buildAdminNightRejectedForRequester(AdminNightRequest request);

    MailMessage buildAdminNightProgramVoteThanks(AdminNightProgramVote vote);

    MailMessage buildAdminNightProgramVoteNotification(
            AdminNightProgramVote vote, String adminEmail);
}
