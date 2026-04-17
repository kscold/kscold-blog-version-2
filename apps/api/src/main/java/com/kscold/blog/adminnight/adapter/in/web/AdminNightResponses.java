package com.kscold.blog.adminnight.adapter.in.web;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;

record SlotResponse(
        String slotKey,
        LocalDate date,
        String weekday,
        String timeLabel,
        String focus,
        String badgeLabel
) {}

record RequestResponse(
        String id,
        String userId,
        String requesterName,
        String requesterEmail,
        String taskTitle,
        String message,
        AdminNightRequest.ParticipationMode participationMode,
        AdminNightRequest.Status status,
        SlotResponse preferredSlot,
        SlotResponse scheduledSlot,
        String reviewNote,
        String decidedByName,
        LocalDateTime decidedAt,
        LocalDateTime createdAt
) {}

record CalendarEntryResponse(
        String id,
        String requesterLabel,
        String taskTitle,
        AdminNightRequest.ParticipationMode participationMode,
        SlotResponse scheduledSlot,
        LocalDateTime createdAt
) {}
