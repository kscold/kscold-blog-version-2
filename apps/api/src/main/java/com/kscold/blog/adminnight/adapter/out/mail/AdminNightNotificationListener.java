package com.kscold.blog.adminnight.adapter.out.mail;

import com.kscold.blog.adminnight.application.event.AdminNightNotificationEvent;
import com.kscold.blog.adminnight.application.event.AdminNightNotificationType;
import com.kscold.blog.adminnight.config.AdminNightProperties;
import com.kscold.blog.identity.adapter.out.mail.RecoveryEmailComposer;
import com.kscold.blog.identity.application.port.out.RecoveryMailSender;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminNightNotificationListener {

    private final RecoveryMailSender recoveryMailSender;
    private final RecoveryEmailComposer recoveryEmailComposer;
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
                            recoveryEmailComposer.buildAdminNightRequestConfirmation(event.request())
                    );
                    recoveryMailSender.send(
                            recoveryEmailComposer.buildAdminNightRequestNotification(
                                    event.request(),
                                    adminNightProperties.getAdminEmail()
                            )
                    );
                }
                case REQUEST_RESUBMITTED -> {
                    recoveryMailSender.send(
                            recoveryEmailComposer.buildAdminNightResubmittedConfirmation(event.request())
                    );
                    recoveryMailSender.send(
                            recoveryEmailComposer.buildAdminNightResubmittedNotification(
                                    event.request(),
                                    adminNightProperties.getAdminEmail()
                            )
                    );
                }
                case REQUEST_APPROVED -> {
                    recoveryMailSender.send(
                            recoveryEmailComposer.buildAdminNightApprovedForRequester(event.request())
                    );
                    recoveryMailSender.send(
                            recoveryEmailComposer.buildAdminNightApprovedForAdmin(
                                    event.request(),
                                    adminNightProperties.getAdminEmail()
                            )
                    );
                }
                case MORE_INFO_REQUESTED -> recoveryMailSender.send(
                        recoveryEmailComposer.buildAdminNightInfoRequestedForRequester(event.request())
                );
                case REQUEST_REJECTED -> recoveryMailSender.send(
                        recoveryEmailComposer.buildAdminNightRejectedForRequester(event.request())
                );
            }
        } catch (Exception exception) {
            log.warn("Admin Night 알림 메일 전송을 건너뜁니다. requester={}", event.request().getRequesterEmail(), exception);
        }
    }
}
