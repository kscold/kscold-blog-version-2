package com.kscold.blog.adminnight.adapter.in.web.dto.request;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class CreateRequest {

    private String requesterName;
    private String taskTitle;
    private String message;
    private AdminNightRequest.ParticipationMode participationMode;
    private SlotRequest preferredSlot;
}
