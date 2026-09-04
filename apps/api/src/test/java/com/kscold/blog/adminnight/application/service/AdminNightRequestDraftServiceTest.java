package com.kscold.blog.adminnight.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.kscold.blog.adminnight.application.dto.command.AdminNightCreateCommand;
import com.kscold.blog.adminnight.application.dto.command.AdminNightDecisionCommand;
import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.exception.InvalidRequestException;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class AdminNightRequestDraftServiceTest {

    private final AdminNightRequestDraftService service = new AdminNightRequestDraftService();

    @Test
    void 신청_문자열을_정규화해_저장한다() {
        AdminNightCreateCommand command = validCommand();

        AdminNightRequest request =
                service.createPendingRequest("user-id", "user@example.com", command);

        assertThat(request.getRequesterName()).isEqualTo("김승찬");
        assertThat(request.getTaskTitle()).isEqualTo("Agent 개선");
        assertThat(request.getMessage()).isEqualTo("완성하기");
        assertThat(request.getPreferredSlot().getFocus()).isEqualTo("집중 개발");
    }

    @Test
    void 신청과_검토_문자열의_최대_길이를_서비스에서도_강제한다() {
        AdminNightCreateCommand longName = command("가".repeat(41), "Agent 개선", "완성하기");
        AdminNightCreateCommand longTask = command("김승찬", "가".repeat(121), "완성하기");
        AdminNightCreateCommand longMessage = command("김승찬", "Agent 개선", "가".repeat(1001));

        assertThatThrownBy(
                        () -> service.createPendingRequest("user-id", "user@example.com", longName))
                .isInstanceOf(InvalidRequestException.class);
        assertThatThrownBy(
                        () -> service.createPendingRequest("user-id", "user@example.com", longTask))
                .isInstanceOf(InvalidRequestException.class);
        assertThatThrownBy(
                        () ->
                                service.createPendingRequest(
                                        "user-id", "user@example.com", longMessage))
                .isInstanceOf(InvalidRequestException.class);
        assertThatThrownBy(() -> service.requireReviewNote("가".repeat(1001)))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Test
    void 승인_슬롯의_각_문자열_길이도_서비스에서_검증한다() {
        AdminNightRequest.SlotInfo slot = validSlot();
        slot.setFocus("가".repeat(121));

        assertThatThrownBy(
                        () ->
                                service.resolveScheduledSlot(
                                        AdminNightDecisionCommand.builder()
                                                .scheduledSlot(slot)
                                                .build()))
                .isInstanceOf(InvalidRequestException.class);
    }

    private AdminNightCreateCommand validCommand() {
        return command(" 김승찬 ", " Agent 개선 ", " 완성하기 ");
    }

    private AdminNightCreateCommand command(String name, String taskTitle, String message) {
        return AdminNightCreateCommand.builder()
                .requesterName(name)
                .taskTitle(taskTitle)
                .message(message)
                .participationMode(AdminNightRequest.ParticipationMode.ONLINE)
                .preferredSlot(validSlot())
                .build();
    }

    private AdminNightRequest.SlotInfo validSlot() {
        return AdminNightRequest.SlotInfo.builder()
                .slotKey("2026-09-05|focus")
                .date(LocalDate.of(2026, 9, 5))
                .weekday("토")
                .timeLabel("20:00-22:00")
                .focus(" 집중 개발 ")
                .badgeLabel("저녁")
                .build();
    }
}
