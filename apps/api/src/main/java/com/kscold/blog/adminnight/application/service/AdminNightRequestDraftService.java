package com.kscold.blog.adminnight.application.service;

import com.kscold.blog.adminnight.application.dto.command.AdminNightCreateCommand;
import com.kscold.blog.adminnight.application.dto.command.AdminNightDecisionCommand;
import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.exception.InvalidRequestException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class AdminNightRequestDraftService {

    private static final int REQUESTER_NAME_MAX_LENGTH = 40;
    private static final int TASK_TITLE_MAX_LENGTH = 120;
    private static final int MESSAGE_MAX_LENGTH = 1000;
    private static final int SLOT_KEY_MAX_LENGTH = 160;
    private static final int WEEKDAY_MAX_LENGTH = 10;
    private static final int TIME_LABEL_MAX_LENGTH = 40;
    private static final int FOCUS_MAX_LENGTH = 120;
    private static final int BADGE_LABEL_MAX_LENGTH = 40;

    public AdminNightRequest createPendingRequest(
            String userId, String userEmail, AdminNightCreateCommand command) {
        return AdminNightRequest.builder()
                .userId(userId)
                .requesterName(
                        normalizeText(
                                command.getRequesterName(),
                                "실명을 입력해주세요.",
                                REQUESTER_NAME_MAX_LENGTH))
                .requesterEmail(userEmail)
                .taskTitle(
                        normalizeText(
                                command.getTaskTitle(), "끝낼 일을 적어주세요.", TASK_TITLE_MAX_LENGTH))
                .message(normalizeOptionalText(command.getMessage(), MESSAGE_MAX_LENGTH))
                .participationMode(requireParticipationMode(command.getParticipationMode()))
                .preferredSlot(requireSlot(command.getPreferredSlot(), "만날 시간을 골라주세요."))
                .status(AdminNightRequest.Status.PENDING)
                .build();
    }

    public void applyResubmission(
            AdminNightRequest request, String userEmail, AdminNightCreateCommand command) {
        request.setRequesterName(
                normalizeText(
                        command.getRequesterName(), "실명을 입력해주세요.", REQUESTER_NAME_MAX_LENGTH));
        request.setRequesterEmail(userEmail);
        request.setTaskTitle(
                normalizeText(command.getTaskTitle(), "끝낼 일을 적어주세요.", TASK_TITLE_MAX_LENGTH));
        request.setMessage(normalizeOptionalText(command.getMessage(), MESSAGE_MAX_LENGTH));
        request.setParticipationMode(requireParticipationMode(command.getParticipationMode()));
        request.setPreferredSlot(requireSlot(command.getPreferredSlot(), "만날 시간을 골라주세요."));
    }

    public AdminNightRequest.SlotInfo resolveScheduledSlot(AdminNightDecisionCommand command) {
        return requireSlot(command.getScheduledSlot(), "승인할 시간을 지정해주세요.");
    }

    public String requireReviewNote(String reviewNote) {
        return normalizeText(reviewNote, "신청자에게 요청할 추가 정보를 적어주세요.", MESSAGE_MAX_LENGTH);
    }

    public String normalizeOptionalReviewNote(String reviewNote) {
        return normalizeOptionalText(reviewNote, MESSAGE_MAX_LENGTH);
    }

    private AdminNightRequest.SlotInfo requireSlot(
            AdminNightRequest.SlotInfo slot, String message) {
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
                .slotKey(normalizeText(slot.getSlotKey(), message, SLOT_KEY_MAX_LENGTH))
                .date(slot.getDate())
                .weekday(normalizeText(slot.getWeekday(), message, WEEKDAY_MAX_LENGTH))
                .timeLabel(normalizeText(slot.getTimeLabel(), message, TIME_LABEL_MAX_LENGTH))
                .focus(normalizeText(slot.getFocus(), message, FOCUS_MAX_LENGTH))
                .badgeLabel(normalizeText(slot.getBadgeLabel(), message, BADGE_LABEL_MAX_LENGTH))
                .build();
    }

    private AdminNightRequest.ParticipationMode requireParticipationMode(
            AdminNightRequest.ParticipationMode participationMode) {
        if (participationMode == null) {
            throw InvalidRequestException.invalidInput("온라인/오프라인 진행 방식을 골라주세요.");
        }
        return participationMode;
    }

    private String normalizeText(String value, String message, int maxLength) {
        if (!StringUtils.hasText(value)) {
            throw InvalidRequestException.invalidInput(message);
        }
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw InvalidRequestException.invalidInput("입력값이 너무 깁니다.");
        }
        return normalized;
    }

    private String normalizeOptionalText(String value, int maxLength) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw InvalidRequestException.invalidInput("입력값이 너무 깁니다.");
        }
        return normalized;
    }
}
