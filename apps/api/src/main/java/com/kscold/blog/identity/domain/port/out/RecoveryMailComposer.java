package com.kscold.blog.identity.domain.port.out;

import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.identity.domain.model.User;

public interface RecoveryMailComposer {

    RecoveryMailMessage buildUsernameReminder(User user);

    RecoveryMailMessage buildPasswordReset(User user, String resetUrl);

    RecoveryMailMessage buildWelcome(User user);

    RecoveryMailMessage buildUnreadChatReminder(
            User user, String adminName, String latestContent, long unreadCount, String actionUrl);

    RecoveryMailMessage buildAdminNightRequestConfirmation(AdminNightRequest request);

    RecoveryMailMessage buildAdminNightRequestNotification(
            AdminNightRequest request, String adminEmail);

    RecoveryMailMessage buildAdminNightApprovedForRequester(AdminNightRequest request);

    RecoveryMailMessage buildAdminNightInfoRequestedForRequester(AdminNightRequest request);

    RecoveryMailMessage buildAdminNightApprovedForAdmin(
            AdminNightRequest request, String adminEmail);

    RecoveryMailMessage buildAdminNightResubmittedConfirmation(AdminNightRequest request);

    RecoveryMailMessage buildAdminNightResubmittedNotification(
            AdminNightRequest request, String adminEmail);

    RecoveryMailMessage buildAdminNightRejectedForRequester(AdminNightRequest request);

    RecoveryMailMessage buildAdminNightProgramVoteThanks(AdminNightProgramVote vote);

    RecoveryMailMessage buildAdminNightProgramVoteNotification(
            AdminNightProgramVote vote, String adminEmail);
}
