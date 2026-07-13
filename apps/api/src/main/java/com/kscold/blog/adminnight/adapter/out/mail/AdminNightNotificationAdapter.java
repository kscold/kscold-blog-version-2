package com.kscold.blog.adminnight.adapter.out.mail;

import com.kscold.blog.adminnight.application.event.AdminNightNotificationEvent;
import com.kscold.blog.adminnight.application.event.AdminNightNotificationType;
import com.kscold.blog.adminnight.application.event.AdminNightProgramVoteNotificationEvent;
import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.adminnight.domain.port.out.AdminNightNotificationPort;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminNightNotificationAdapter implements AdminNightNotificationPort {

    private final ApplicationEventPublisher applicationEventPublisher;

    @Override
    public void notifyRequestCreated(AdminNightRequest request) {
        publish(AdminNightNotificationType.REQUEST_CREATED, request);
    }

    @Override
    public void notifyRequestResubmitted(AdminNightRequest request) {
        publish(AdminNightNotificationType.REQUEST_RESUBMITTED, request);
    }

    @Override
    public void notifyRequestApproved(AdminNightRequest request) {
        publish(AdminNightNotificationType.REQUEST_APPROVED, request);
    }

    @Override
    public void notifyMoreInfoRequested(AdminNightRequest request) {
        publish(AdminNightNotificationType.MORE_INFO_REQUESTED, request);
    }

    @Override
    public void notifyRequestRejected(AdminNightRequest request) {
        publish(AdminNightNotificationType.REQUEST_REJECTED, request);
    }

    @Override
    public void notifyProgramVoteSubmitted(AdminNightProgramVote vote) {
        applicationEventPublisher.publishEvent(new AdminNightProgramVoteNotificationEvent(vote));
    }

    private void publish(AdminNightNotificationType type, AdminNightRequest request) {
        applicationEventPublisher.publishEvent(new AdminNightNotificationEvent(type, request));
    }
}
