package com.kscold.blog.adminnight.application.service;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import java.time.LocalDate;

final class AdminNightScheduleRange {

    private AdminNightScheduleRange() {}

    static boolean includes(AdminNightRequest request, LocalDate from, LocalDate to) {
        if (request.getScheduledSlot() == null || request.getScheduledSlot().getDate() == null) {
            return false;
        }

        LocalDate scheduledDate = request.getScheduledSlot().getDate();
        return !scheduledDate.isBefore(from) && !scheduledDate.isAfter(to);
    }
}
