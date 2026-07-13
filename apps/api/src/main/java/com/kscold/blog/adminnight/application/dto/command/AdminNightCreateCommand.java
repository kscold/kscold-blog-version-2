package com.kscold.blog.adminnight.application.dto.command;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AdminNightCreateCommand {

    private String requesterName;

    private String taskTitle;

    private String message;

    private AdminNightRequest.ParticipationMode participationMode;

    private AdminNightRequest.SlotInfo preferredSlot;
}
