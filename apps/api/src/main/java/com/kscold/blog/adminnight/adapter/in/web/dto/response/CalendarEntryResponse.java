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
public class CalendarEntryResponse {

    private String id;
    private String requesterLabel;
    private String taskTitle;
    private AdminNightRequest.ParticipationMode participationMode;
    private SlotResponse scheduledSlot;
    private LocalDateTime createdAt;
}
