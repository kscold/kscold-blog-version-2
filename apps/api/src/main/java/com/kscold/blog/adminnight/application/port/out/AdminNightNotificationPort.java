package com.kscold.blog.adminnight.application.port.out;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;

public interface AdminNightNotificationPort {

    void notifyRequestCreated(AdminNightRequest request);

    void notifyRequestResubmitted(AdminNightRequest request);

    void notifyRequestApproved(AdminNightRequest request);

    void notifyMoreInfoRequested(AdminNightRequest request);

    void notifyRequestRejected(AdminNightRequest request);
}
