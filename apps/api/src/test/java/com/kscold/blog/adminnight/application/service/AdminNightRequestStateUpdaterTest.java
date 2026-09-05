package com.kscold.blog.adminnight.application.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class AdminNightRequestStateUpdaterTest {

    @Test
    @DisplayName("거절 상태 전이는 확정 슬롯을 비우고 관리자 결정을 기록한다")
    void rejectClearsScheduleAndRecordsDecision() {
        AdminNightRequest request =
                AdminNightRequest.builder()
                        .status(AdminNightRequest.Status.PENDING)
                        .scheduledSlot(
                                AdminNightRequest.SlotInfo.builder().slotKey("slot-1").build())
                        .build();
        LocalDateTime decidedAt = LocalDateTime.of(2026, 9, 5, 10, 0);
        AdminNightRequestStateUpdater.DecisionActor actor =
                new AdminNightRequestStateUpdater.DecisionActor("admin-1", "김승찬", decidedAt);

        AdminNightRequestStateUpdater.reject(request, "일정이 맞지 않습니다.", actor);

        assertThat(request.getStatus()).isEqualTo(AdminNightRequest.Status.REJECTED);
        assertThat(request.getScheduledSlot()).isNull();
        assertThat(request.getReviewNote()).isEqualTo("일정이 맞지 않습니다.");
        assertThat(request.getDecidedByUserId()).isEqualTo("admin-1");
        assertThat(request.getDecidedByName()).isEqualTo("김승찬");
        assertThat(request.getDecidedAt()).isEqualTo(decidedAt);
    }
}
