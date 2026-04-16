package com.kscold.blog.adminnight.application.service;

import com.kscold.blog.adminnight.application.dto.AdminNightCreateCommand;
import com.kscold.blog.adminnight.application.dto.AdminNightDecisionCommand;
import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.exception.InvalidRequestException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class AdminNightRequestDraftService {

    public AdminNightRequest createPendingRequest(String userId, String userEmail, AdminNightCreateCommand command) {
        return AdminNightRequest.builder()
                .userId(userId)
                .requesterName(normalizeText(command.requesterName(), "실명을 입력해주세요."))
                .requesterEmail(userEmail)
                .taskTitle(normalizeText(command.taskTitle(), "끝낼 일을 적어주세요."))
                .message(normalizeOptionalText(command.message()))
                .participationMode(requireParticipationMode(command.participationMode()))
                .preferredSlot(requireSlot(command.preferredSlot(), "만날 시간을 골라주세요."))
                .status(AdminNightRequest.Status.PENDING)
                .build();
    }

    public void applyResubmission(AdminNightRequest request, String userEmail, AdminNightCreateCommand command) {
        request.setRequesterName(normalizeText(command.requesterName(), "실명을 입력해주세요."));
        request.setRequesterEmail(userEmail);
        request.setTaskTitle(normalizeText(command.taskTitle(), "끝낼 일을 적어주세요."));
        request.setMessage(normalizeOptionalText(command.message()));
        request.setParticipationMode(requireParticipationMode(command.participationMode()));
        request.setPreferredSlot(requireSlot(command.preferredSlot(), "만날 시간을 골라주세요."));
    }

    public AdminNightRequest.SlotInfo resolveScheduledSlot(AdminNightDecisionCommand command) {
        return requireSlot(command.scheduledSlot(), "승인할 시간을 지정해주세요.");
    }

    public String requireReviewNote(String reviewNote) {
        return normalizeText(reviewNote, "신청자에게 요청할 추가 정보를 적어주세요.");
    }

    public String normalizeOptionalReviewNote(String reviewNote) {
        return normalizeOptionalText(reviewNote);
    }

    private AdminNightRequest.SlotInfo requireSlot(AdminNightRequest.SlotInfo slot, String message) {
        if (slot == null) {
            throw InvalidRequestException.invalidInput(message);
        }

        if (!StringUtils.hasText(slot.getSlotKey())
                || slot.getDate() == null
                || !StringUtils.hasText(slot.getWeekday())
                || !StringUtils.hasText(slot.getTimeLabel())
                || !StringUtils.hasText(slot.getFocus())
                || !StringUtils.hasText(slot.getBadgeLabel())) {
            throw InvalidRequestException.invalidInput(message);
        }

        return AdminNightRequest.SlotInfo.builder()
                .slotKey(slot.getSlotKey().trim())
                .date(slot.getDate())
                .weekday(slot.getWeekday().trim())
                .timeLabel(slot.getTimeLabel().trim())
                .focus(slot.getFocus().trim())
                .badgeLabel(slot.getBadgeLabel().trim())
                .build();
    }

    private AdminNightRequest.ParticipationMode requireParticipationMode(AdminNightRequest.ParticipationMode participationMode) {
        if (participationMode == null) {
            throw InvalidRequestException.invalidInput("온라인/오프라인 진행 방식을 골라주세요.");
        }
        return participationMode;
    }

    private String normalizeText(String value, String message) {
        if (!StringUtils.hasText(value)) {
            throw InvalidRequestException.invalidInput(message);
        }
        return value.trim();
    }

    private String normalizeOptionalText(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
