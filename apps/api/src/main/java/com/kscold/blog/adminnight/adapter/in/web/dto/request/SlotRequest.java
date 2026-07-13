package com.kscold.blog.adminnight.adapter.in.web.dto.request;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SlotRequest {

    private String slotKey;
    private LocalDate date;
    private String weekday;
    private String timeLabel;
    private String focus;
    private String badgeLabel;
}
