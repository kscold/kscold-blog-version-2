package com.kscold.blog.adminnight.application.event;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;

public record AdminNightNotificationEvent(
        AdminNightNotificationType type,
        AdminNightRequest request
) {
}
