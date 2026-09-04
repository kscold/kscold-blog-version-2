package com.kscold.blog.adminnight.adapter.in.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SlotRequest {

    @NotBlank(message = "시간 식별자가 필요합니다")
    @Size(max = 160, message = "시간 식별자가 너무 깁니다")
    private String slotKey;

    @NotNull(message = "날짜가 필요합니다")
    private LocalDate date;

    @NotBlank(message = "요일이 필요합니다")
    @Size(max = 10, message = "요일이 너무 깁니다")
    private String weekday;

    @NotBlank(message = "시간이 필요합니다")
    @Size(max = 40, message = "시간이 너무 깁니다")
    private String timeLabel;

    @NotBlank(message = "집중 주제가 필요합니다")
    @Size(max = 120, message = "집중 주제가 너무 깁니다")
    private String focus;

    @NotBlank(message = "시간 배지가 필요합니다")
    @Size(max = 40, message = "시간 배지가 너무 깁니다")
    private String badgeLabel;
}
