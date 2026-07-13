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

    public static CalendarEntryResponse from(AdminNightRequest request) {
        return CalendarEntryResponse.builder()
                .id(request.getId())
                .requesterLabel(maskName(request.getRequesterName()))
                .taskTitle(request.getTaskTitle())
                .participationMode(request.getParticipationMode())
                .scheduledSlot(SlotResponse.from(request.getScheduledSlot()))
                .createdAt(request.getCreatedAt())
                .build();
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
