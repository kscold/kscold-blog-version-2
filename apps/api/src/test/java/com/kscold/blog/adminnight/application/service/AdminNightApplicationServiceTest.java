package com.kscold.blog.adminnight.application.service;

import com.kscold.blog.adminnight.application.dto.AdminNightCreateCommand;
import com.kscold.blog.adminnight.application.dto.AdminNightDecisionCommand;
import com.kscold.blog.adminnight.application.port.out.AdminNightNotificationPort;
import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.adminnight.domain.port.out.AdminNightRequestRepository;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.support.UserFixtures;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminNightApplicationServiceTest {

    @Mock
    private AdminNightRequestRepository adminNightRequestRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserQueryPort userQueryPort;

    @Mock
    private AdminNightNotificationPort adminNightNotificationPort;

    @Spy
    private AdminNightRequestDraftService adminNightRequestDraftService;

    @InjectMocks
    private AdminNightApplicationService adminNightApplicationService;

    @Test
    @DisplayName("시나리오: 로그인 사용자가 Admin Night 신청을 보내면 저장 후 알림 포트가 호출된다")
    void createRequestPublishesNotification() {
        User user = UserFixtures.user("user-1", User.Role.USER, "nightowl", "류태호");
        AdminNightRequest.SlotInfo slot = slot("2026-04-15", "수", "21:30 - 23:00", "PR Window", "Open");

        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(adminNightRequestRepository.save(any(AdminNightRequest.class))).thenAnswer(invocation -> {
            AdminNightRequest request = invocation.getArgument(0);
            request.setId("request-1");
            request.setCreatedAt(LocalDateTime.of(2026, 4, 14, 21, 0));
            return request;
        });

        AdminNightRequest saved = adminNightApplicationService.createRequest(
                "user-1",
                new AdminNightCreateCommand(
                        "류태호",
                        "문서 정리",
                        "밀린 메일과 문서를 정리하고 싶어요.",
                        AdminNightRequest.ParticipationMode.OFFLINE,
                        slot
                )
        );

        assertThat(saved.getId()).isEqualTo("request-1");
        assertThat(saved.getRequesterName()).isEqualTo("류태호");
        assertThat(saved.getTaskTitle()).isEqualTo("문서 정리");
        assertThat(saved.getParticipationMode()).isEqualTo(AdminNightRequest.ParticipationMode.OFFLINE);
        assertThat(saved.getPreferredSlot().getSlotKey()).isEqualTo(slot.getSlotKey());
        verify(adminNightNotificationPort).notifyRequestCreated(saved);
    }

    @Test
    @DisplayName("시나리오: 관리자가 신청을 승인하면 일정 슬롯이 저장되고 승인 알림이 발행된다")
    void approveStoresScheduleAndPublishesNotification() {
        AdminNightRequest request = AdminNightRequest.builder()
                .id("request-1")
                .userId("user-1")
                .requesterName("류태호")
                .requesterEmail("nightowl@example.com")
                .taskTitle("블로그 초안 정리")
                .participationMode(AdminNightRequest.ParticipationMode.FLEXIBLE)
                .preferredSlot(slot("2026-04-16", "목", "20:30 - 22:00", "Inbox Sweep", "Open"))
                .status(AdminNightRequest.Status.PENDING)
                .build();
        AdminNightRequest.SlotInfo scheduledSlot = slot("2026-04-18", "토", "14:00 - 16:30", "Weekend Reset", "Weekend");
        when(adminNightRequestRepository.findById("request-1")).thenReturn(Optional.of(request));
        when(userQueryPort.getUserById("admin-1")).thenReturn(new UserQueryPort.UserInfo("admin-1", "김승찬", null, true));
        when(adminNightRequestRepository.save(any(AdminNightRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminNightRequest approved = adminNightApplicationService.approve(
                "request-1",
                "admin-1",
                new AdminNightDecisionCommand(scheduledSlot)
        );

        assertThat(approved.getStatus()).isEqualTo(AdminNightRequest.Status.APPROVED);
        assertThat(approved.getScheduledSlot().getSlotKey()).isEqualTo(scheduledSlot.getSlotKey());
        assertThat(approved.getDecidedByName()).isEqualTo("김승찬");
        assertThat(approved.getParticipationMode()).isEqualTo(AdminNightRequest.ParticipationMode.FLEXIBLE);
        verify(adminNightNotificationPort).notifyRequestApproved(approved);
    }

    @Test
    @DisplayName("시나리오: 관리자가 추가 정보를 요청하면 메모와 함께 INFO_REQUESTED 상태로 저장된다")
    void requestMoreInfoStoresReviewNoteAndPublishesNotification() {
        AdminNightRequest request = AdminNightRequest.builder()
                .id("request-1")
                .userId("user-1")
                .requesterName("류태호")
                .requesterEmail("nightowl@example.com")
                .taskTitle("실제 만남 전 확인이 필요한 신청")
                .participationMode(AdminNightRequest.ParticipationMode.OFFLINE)
                .preferredSlot(slot("2026-04-16", "목", "20:30 - 22:00", "Inbox Sweep", "Open"))
                .status(AdminNightRequest.Status.PENDING)
                .build();
        when(adminNightRequestRepository.findById("request-1")).thenReturn(Optional.of(request));
        when(userQueryPort.getUserById("admin-1")).thenReturn(new UserQueryPort.UserInfo("admin-1", "김승찬", null, true));
        when(adminNightRequestRepository.save(any(AdminNightRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminNightRequest infoRequested = adminNightApplicationService.requestMoreInfo(
                "request-1",
                "admin-1",
                "실명 확인이 어려워서 소개할 수 있는 링크나 배경을 조금 더 남겨주세요."
        );

        assertThat(infoRequested.getStatus()).isEqualTo(AdminNightRequest.Status.INFO_REQUESTED);
        assertThat(infoRequested.getReviewNote()).contains("실명 확인");
        assertThat(infoRequested.getDecidedByName()).isEqualTo("김승찬");
        verify(adminNightNotificationPort).notifyMoreInfoRequested(infoRequested);
    }

    @Test
    @DisplayName("시나리오: 신청자가 추가 정보 요청을 반영해 다시 보내면 대기 상태로 복귀하고 알림이 발행된다")
    void resubmitReturnsRequestToPendingAndPublishesNotification() {
        User user = UserFixtures.user("user-1", User.Role.USER, "nightowl", "류태호");
        AdminNightRequest request = AdminNightRequest.builder()
                .id("request-1")
                .userId("user-1")
                .requesterName("류태호")
                .requesterEmail("nightowl@example.com")
                .taskTitle("기존 신청")
                .message("첫 번째 신청 메모")
                .participationMode(AdminNightRequest.ParticipationMode.FLEXIBLE)
                .preferredSlot(slot("2026-04-16", "목", "20:30 - 22:00", "Inbox Sweep", "Open"))
                .reviewNote("실명과 배경이 더 필요합니다.")
                .status(AdminNightRequest.Status.INFO_REQUESTED)
                .decidedByName("김승찬")
                .build();
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(adminNightRequestRepository.findById("request-1")).thenReturn(Optional.of(request));
        when(adminNightRequestRepository.save(any(AdminNightRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminNightRequest resubmitted = adminNightApplicationService.resubmit(
                "request-1",
                "user-1",
                new AdminNightCreateCommand(
                        "류태호",
                        "실명과 진행 방식을 보완한 신청",
                        "오프라인으로 만나서 문서 정리와 메일 답장을 마무리하고 싶어요.",
                        AdminNightRequest.ParticipationMode.OFFLINE,
                        slot("2026-04-18", "토", "14:00 - 16:30", "Weekend Reset", "Weekend")
                )
        );

        assertThat(resubmitted.getStatus()).isEqualTo(AdminNightRequest.Status.PENDING);
        assertThat(resubmitted.getReviewNote()).isNull();
        assertThat(resubmitted.getParticipationMode()).isEqualTo(AdminNightRequest.ParticipationMode.OFFLINE);
        assertThat(resubmitted.getPreferredSlot().getFocus()).isEqualTo("Weekend Reset");
        assertThat(resubmitted.getDecidedByName()).isNull();
        assertThat(resubmitted.getDecidedByUserId()).isNull();
        assertThat(resubmitted.getDecidedAt()).isNull();
        verify(adminNightNotificationPort).notifyRequestResubmitted(resubmitted);
    }

    private AdminNightRequest.SlotInfo slot(String date, String weekday, String timeLabel, String focus, String badgeLabel) {
        LocalDate localDate = LocalDate.parse(date);
        return AdminNightRequest.SlotInfo.builder()
                .slotKey(date + "|" + focus)
                .date(localDate)
                .weekday(weekday)
                .timeLabel(timeLabel)
                .focus(focus)
                .badgeLabel(badgeLabel)
                .build();
    }
}
