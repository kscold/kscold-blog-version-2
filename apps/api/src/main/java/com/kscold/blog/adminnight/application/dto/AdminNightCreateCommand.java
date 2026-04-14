package com.kscold.blog.adminnight.application.dto;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;

public record AdminNightCreateCommand(
        String requesterName,
        String taskTitle,
        String message,
        AdminNightRequest.ParticipationMode participationMode,
        AdminNightRequest.SlotInfo preferredSlot
) {
}
