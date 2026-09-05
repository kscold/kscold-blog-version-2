package com.kscold.blog.adminnight.application.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class AdminNightScheduleRangeTest {

    private static final LocalDate FROM = LocalDate.of(2026, 9, 5);
    private static final LocalDate TO = LocalDate.of(2026, 9, 12);

    @Test
    @DisplayName("조회 시작일과 종료일의 일정도 범위에 포함한다")
    void includesBoundaryDates() {
        assertThat(List.of(includes(FROM), includes(TO))).containsExactly(true, true);
    }

    @Test
    @DisplayName("일정이 없거나 조회 범위 밖이면 제외한다")
    void excludesMissingAndOutsideDates() {
        AdminNightRequest missingSchedule = AdminNightRequest.builder().build();
        AdminNightRequest missingDate =
                AdminNightRequest.builder()
                        .scheduledSlot(AdminNightRequest.SlotInfo.builder().build())
                        .build();

        assertThat(
                        List.of(
                                AdminNightScheduleRange.includes(missingSchedule, FROM, TO),
                                AdminNightScheduleRange.includes(missingDate, FROM, TO),
                                includes(FROM.minusDays(1)),
                                includes(TO.plusDays(1))))
                .containsOnly(false);
    }

    private boolean includes(LocalDate scheduledDate) {
        AdminNightRequest request =
                AdminNightRequest.builder()
                        .scheduledSlot(
                                AdminNightRequest.SlotInfo.builder().date(scheduledDate).build())
                        .build();
        return AdminNightScheduleRange.includes(request, FROM, TO);
    }
}
