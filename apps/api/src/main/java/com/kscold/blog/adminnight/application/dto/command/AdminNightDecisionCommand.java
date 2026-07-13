package com.kscold.blog.adminnight.application.dto.command;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AdminNightDecisionCommand {

    private AdminNightRequest.SlotInfo scheduledSlot;
}
