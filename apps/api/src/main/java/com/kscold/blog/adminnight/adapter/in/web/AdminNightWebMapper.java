package com.kscold.blog.adminnight.adapter.in.web;

import com.kscold.blog.adminnight.adapter.in.web.dto.request.SlotRequest;
import com.kscold.blog.adminnight.domain.model.AdminNightRequest;

final class AdminNightWebMapper {

    private AdminNightWebMapper() {}

    static AdminNightRequest.SlotInfo toSlot(SlotRequest slot) {
        if (slot == null) {
            return null;
        }

        return AdminNightRequest.SlotInfo.builder()
                .slotKey(slot.getSlotKey())
                .date(slot.getDate())
                .weekday(slot.getWeekday())
                .timeLabel(slot.getTimeLabel())
                .focus(slot.getFocus())
                .badgeLabel(slot.getBadgeLabel())
                .build();
    }
}
