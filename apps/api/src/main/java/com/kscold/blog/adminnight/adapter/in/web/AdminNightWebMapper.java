package com.kscold.blog.adminnight.adapter.in.web;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;

final class AdminNightWebMapper {

    private AdminNightWebMapper() {
    }

    static AdminNightRequest.SlotInfo toSlot(SlotBody slot) {
        if (slot == null) {
            return null;
        }

        return AdminNightRequest.SlotInfo.builder()
                .slotKey(slot.slotKey())
                .date(slot.date())
                .weekday(slot.weekday())
                .timeLabel(slot.timeLabel())
                .focus(slot.focus())
                .badgeLabel(slot.badgeLabel())
                .build();
    }

    static RequestResponse toResponse(AdminNightRequest request) {
        return new RequestResponse(
                request.getId(),
                request.getUserId(),
                request.getRequesterName(),
                request.getRequesterEmail(),
                request.getTaskTitle(),
                request.getMessage(),
                request.getParticipationMode(),
                request.getStatus(),
                toSlotResponse(request.getPreferredSlot()),
                toSlotResponse(request.getScheduledSlot()),
                request.getReviewNote(),
                request.getDecidedByName(),
                request.getDecidedAt(),
                request.getCreatedAt()
        );
    }

    static CalendarEntryResponse toCalendarEntry(AdminNightRequest request) {
        return new CalendarEntryResponse(
                request.getId(),
                maskName(request.getRequesterName()),
                request.getTaskTitle(),
                request.getParticipationMode(),
                toSlotResponse(request.getScheduledSlot()),
                request.getCreatedAt()
        );
    }

    private static SlotResponse toSlotResponse(AdminNightRequest.SlotInfo slot) {
        if (slot == null) {
            return null;
        }

        return new SlotResponse(
                slot.getSlotKey(),
                slot.getDate(),
                slot.getWeekday(),
                slot.getTimeLabel(),
                slot.getFocus(),
                slot.getBadgeLabel()
        );
    }

    private static String maskName(String name) {
        if (name == null || name.isBlank()) {
            return "익명";
        }
        if (name.length() == 1) {
            return name + "*";
        }
        if (name.length() == 2) {
            return name.charAt(0) + "*";
        }
        return name.charAt(0) + "*" + name.charAt(name.length() - 1);
    }
}
