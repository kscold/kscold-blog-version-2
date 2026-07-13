package com.kscold.blog.adminnight.adapter.in.web.dto.response;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestResponse {

    private String id;
    private String userId;
    private String requesterName;
    private String requesterEmail;
    private String taskTitle;
    private String message;
    private AdminNightRequest.ParticipationMode participationMode;
    private AdminNightRequest.Status status;
    private SlotResponse preferredSlot;
    private SlotResponse scheduledSlot;
    private String reviewNote;
    private String decidedByName;
    private LocalDateTime decidedAt;
    private LocalDateTime createdAt;
}
