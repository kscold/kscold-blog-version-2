package com.kscold.blog.adminnight.adapter.in.web;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;

import java.time.LocalDate;

record CreateRequestBody(
        String requesterName,
        String taskTitle,
        String message,
        AdminNightRequest.ParticipationMode participationMode,
        SlotBody preferredSlot
) {}

record ApproveRequestBody(SlotBody scheduledSlot) {}

record ReviewRequestBody(String reviewNote) {}

record SlotBody(
        String slotKey,
        LocalDate date,
        String weekday,
        String timeLabel,
        String focus,
        String badgeLabel
) {}
