package com.kscold.blog.adminnight.adapter.out.mail;

import com.kscold.blog.adminnight.application.event.AdminNightNotificationEvent;
import com.kscold.blog.adminnight.application.event.AdminNightProgramVoteNotificationEvent;
import com.kscold.blog.adminnight.config.AdminNightProperties;
import com.kscold.blog.adminnight.domain.port.out.AdminNightProgramVoteMailComposer;
import com.kscold.blog.adminnight.domain.port.out.AdminNightRequestMailComposer;
import com.kscold.blog.notification.domain.port.out.MailSender;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminNightNotificationListener {

    private final MailSender recoveryMailSender;
    private final AdminNightRequestMailComposer requestMailComposer;
    private final AdminNightProgramVoteMailComposer programVoteMailComposer;
    private final AdminNightProperties adminNightProperties;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(AdminNightNotificationEvent event) {
        if (!recoveryMailSender.isAvailable()) {
            return;
        }

        try {
            switch (event.type()) {
                case REQUEST_CREATED -> {
                    recoveryMailSender.send(
                            requestMailComposer.buildRequestConfirmation(event.request()));
                    recoveryMailSender.send(
                            requestMailComposer.buildRequestNotification(
                                    event.request(), adminNightProperties.getAdminEmail()));
                }
                case REQUEST_RESUBMITTED -> {
                    recoveryMailSender.send(
                            requestMailComposer.buildResubmittedConfirmation(event.request()));
                    recoveryMailSender.send(
                            requestMailComposer.buildResubmittedNotification(
                                    event.request(), adminNightProperties.getAdminEmail()));
                }
                case REQUEST_APPROVED -> {
                    recoveryMailSender.send(
                            requestMailComposer.buildApprovedForRequester(event.request()));
                    recoveryMailSender.send(
                            requestMailComposer.buildApprovedForAdmin(
                                    event.request(), adminNightProperties.getAdminEmail()));
                }
                case MORE_INFO_REQUESTED ->
                        recoveryMailSender.send(
                                requestMailComposer.buildInfoRequestedForRequester(
                                        event.request()));
                case REQUEST_REJECTED ->
                        recoveryMailSender.send(
                                requestMailComposer.buildRejectedForRequester(event.request()));
            }
        } catch (Exception exception) {
            log.warn(
                    "Admin Night 알림 메일 전송을 건너뜁니다. requester={}",
                    event.request().getRequesterEmail(),
                    exception);
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(AdminNightProgramVoteNotificationEvent event) {
        if (!recoveryMailSender.isAvailable()) {
            return;
        }

        try {
            recoveryMailSender.send(programVoteMailComposer.buildProgramVoteThanks(event.vote()));
            recoveryMailSender.send(
                    programVoteMailComposer.buildProgramVoteNotification(
                            event.vote(), adminNightProperties.getAdminEmail()));
        } catch (Exception exception) {
            log.warn(
                    "AI Agent Bloom 투표 알림 메일 전송을 건너뜁니다. requester={}",
                    event.vote().getContactEmail(),
                    exception);
        }
    }
}
