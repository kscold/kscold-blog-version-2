package com.kscold.blog.adminnight.adapter.in.web.dto.response;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlotResponse {

    private String slotKey;
    private LocalDate date;
    private String weekday;
    private String timeLabel;
    private String focus;
    private String badgeLabel;

    public static SlotResponse from(AdminNightRequest.SlotInfo slot) {
        if (slot == null) {
            return null;
        }

        return SlotResponse.builder()
                .slotKey(slot.getSlotKey())
                .date(slot.getDate())
                .weekday(slot.getWeekday())
                .timeLabel(slot.getTimeLabel())
                .focus(slot.getFocus())
                .badgeLabel(slot.getBadgeLabel())
                .build();
    }
}
