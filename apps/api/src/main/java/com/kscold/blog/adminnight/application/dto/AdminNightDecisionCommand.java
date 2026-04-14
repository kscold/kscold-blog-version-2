package com.kscold.blog.adminnight.application.dto;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;

public record AdminNightDecisionCommand(
        AdminNightRequest.SlotInfo scheduledSlot
) {
}
