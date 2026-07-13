package com.kscold.blog.adminnight.adapter.in.web.dto.response;

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
}
