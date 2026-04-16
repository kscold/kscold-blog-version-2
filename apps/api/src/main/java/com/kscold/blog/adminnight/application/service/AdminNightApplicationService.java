package com.kscold.blog.adminnight.application.service;

import com.kscold.blog.adminnight.application.dto.AdminNightCreateCommand;
import com.kscold.blog.adminnight.application.dto.AdminNightDecisionCommand;
import com.kscold.blog.adminnight.application.port.in.AdminNightUseCase;
import com.kscold.blog.adminnight.application.port.out.AdminNightNotificationPort;
import com.kscold.blog.adminnight.config.AdminNightProperties;
import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.adminnight.domain.port.out.AdminNightRequestRepository;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminNightApplicationService implements AdminNightUseCase {

    private final AdminNightRequestRepository adminNightRequestRepository;
    private final UserRepository userRepository;
    private final UserQueryPort userQueryPort;
    private final AdminNightNotificationPort adminNightNotificationPort;

    @Override
    @Transactional
    public AdminNightRequest createRequest(String userId, AdminNightCreateCommand command) {
        User user = requireUser(userId);
        String requesterName = normalizeText(command.requesterName(), "실명을 입력해주세요.");
        String taskTitle = normalizeText(command.taskTitle(), "끝낼 일을 적어주세요.");
        String message = normalizeOptionalText(command.message());
        AdminNightRequest.ParticipationMode participationMode = requireParticipationMode(command.participationMode());
        AdminNightRequest.SlotInfo preferredSlot = requireSlot(command.preferredSlot(), "같이 붙고 싶은 시간을 골라주세요.");

        AdminNightRequest request = AdminNightRequest.builder()
                .userId(user.getId())
                .requesterName(requesterName)
                .requesterEmail(user.getEmail())
                .taskTitle(taskTitle)
                .message(message)
                .participationMode(participationMode)
                .preferredSlot(preferredSlot)
                .status(AdminNightRequest.Status.PENDING)
                .build();

        AdminNightRequest saved = adminNightRequestRepository.save(request);
        adminNightNotificationPort.notifyRequestCreated(saved);
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminNightRequest> getMyRequests(String userId) {
        if (!StringUtils.hasText(userId)) {
            throw InvalidRequestException.invalidInput("로그인이 필요합니다.");
        }
        return adminNightRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminNightRequest> getRequests(AdminNightRequest.Status status) {
        if (status != null) {
            return adminNightRequestRepository.findByStatusOrderByCreatedAtDesc(status);
        }
        return adminNightRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminNightRequest> getApprovedRequests(LocalDate from, LocalDate to) {
        return adminNightRequestRepository.findByStatusOrderByCreatedAtDesc(AdminNightRequest.Status.APPROVED).stream()
                .filter(request -> request.getScheduledSlot() != null && request.getScheduledSlot().getDate() != null)
                .filter(request -> !request.getScheduledSlot().getDate().isBefore(from))
                .filter(request -> !request.getScheduledSlot().getDate().isAfter(to))
                .toList();
    }

    @Override
    @Transactional
    public AdminNightRequest resubmit(String requestId, String userId, AdminNightCreateCommand command) {
        User user = requireUser(userId);
        AdminNightRequest request = findRequest(requestId);
        validateRequester(user, request);

        if (request.getStatus() != AdminNightRequest.Status.INFO_REQUESTED) {
            throw InvalidRequestException.invalidInput("추가 정보 요청된 신청만 보완해서 다시 보낼 수 있습니다.");
        }

        String requesterName = normalizeText(command.requesterName(), "실명을 입력해주세요.");
        String taskTitle = normalizeText(command.taskTitle(), "끝낼 일을 적어주세요.");
        String message = normalizeOptionalText(command.message());
        AdminNightRequest.ParticipationMode participationMode = requireParticipationMode(command.participationMode());
        AdminNightRequest.SlotInfo preferredSlot = requireSlot(command.preferredSlot(), "같이 붙고 싶은 시간을 골라주세요.");

        request.setRequesterName(requesterName);
        request.setRequesterEmail(user.getEmail());
        request.setTaskTitle(taskTitle);
        request.setMessage(message);
        request.setParticipationMode(participationMode);
        request.setPreferredSlot(preferredSlot);
        request.setScheduledSlot(null);
        request.setReviewNote(null);
        request.setStatus(AdminNightRequest.Status.PENDING);
        request.setDecidedAt(null);
        request.setDecidedByUserId(null);
        request.setDecidedByName(null);

        AdminNightRequest saved = adminNightRequestRepository.save(request);
        adminNightNotificationPort.notifyRequestResubmitted(saved);
        return saved;
    }

    @Override
    @Transactional
    public AdminNightRequest approve(String requestId, String adminUserId, AdminNightDecisionCommand command) {
        UserQueryPort.UserInfo admin = requireAdmin(adminUserId);
        AdminNightRequest request = findRequest(requestId);

        if (request.getStatus() == AdminNightRequest.Status.REJECTED) {
            throw InvalidRequestException.invalidInput("거절된 신청은 다시 승인할 수 없습니다.");
        }

        AdminNightRequest.SlotInfo scheduledSlot = requireSlot(command.scheduledSlot(), "승인할 시간을 지정해주세요.");
        request.setStatus(AdminNightRequest.Status.APPROVED);
        request.setScheduledSlot(scheduledSlot);
        request.setReviewNote(null);
        request.setDecidedAt(LocalDateTime.now());
        request.setDecidedByUserId(admin.id());
        request.setDecidedByName(admin.displayName());

        AdminNightRequest saved = adminNightRequestRepository.save(request);
        adminNightNotificationPort.notifyRequestApproved(saved);
        return saved;
    }

    @Override
    @Transactional
    public AdminNightRequest requestMoreInfo(String requestId, String adminUserId, String reviewNote) {
        UserQueryPort.UserInfo admin = requireAdmin(adminUserId);
        AdminNightRequest request = findRequest(requestId);

        if (request.getStatus() == AdminNightRequest.Status.APPROVED) {
            throw InvalidRequestException.invalidInput("이미 승인된 일정에는 추가 정보를 요청할 수 없습니다.");
        }
        if (request.getStatus() == AdminNightRequest.Status.REJECTED) {
            throw InvalidRequestException.invalidInput("거절된 신청에는 추가 정보를 요청할 수 없습니다.");
        }

        request.setStatus(AdminNightRequest.Status.INFO_REQUESTED);
        request.setScheduledSlot(null);
        request.setReviewNote(normalizeText(reviewNote, "신청자에게 요청할 추가 정보를 적어주세요."));
        request.setDecidedAt(LocalDateTime.now());
        request.setDecidedByUserId(admin.id());
        request.setDecidedByName(admin.displayName());

        AdminNightRequest saved = adminNightRequestRepository.save(request);
        adminNightNotificationPort.notifyMoreInfoRequested(saved);
        return saved;
    }

    @Override
    @Transactional
    public AdminNightRequest reject(String requestId, String adminUserId, String reviewNote) {
        UserQueryPort.UserInfo admin = requireAdmin(adminUserId);
        AdminNightRequest request = findRequest(requestId);

        if (request.getStatus() == AdminNightRequest.Status.APPROVED) {
            throw InvalidRequestException.invalidInput("이미 승인된 일정은 거절할 수 없습니다.");
        }

        request.setStatus(AdminNightRequest.Status.REJECTED);
        request.setScheduledSlot(null);
        request.setReviewNote(normalizeOptionalText(reviewNote));
        request.setDecidedAt(LocalDateTime.now());
        request.setDecidedByUserId(admin.id());
        request.setDecidedByName(admin.displayName());
        AdminNightRequest saved = adminNightRequestRepository.save(request);
        adminNightNotificationPort.notifyRequestRejected(saved);
        return saved;
    }

    private User requireUser(String userId) {
        if (!StringUtils.hasText(userId)) {
            throw InvalidRequestException.invalidInput("로그인이 필요합니다.");
        }

        return userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));
    }

    private UserQueryPort.UserInfo requireAdmin(String userId) {
        if (!StringUtils.hasText(userId)) {
            throw InvalidRequestException.invalidInput("관리자 인증이 필요합니다.");
        }

        UserQueryPort.UserInfo admin = userQueryPort.getUserById(userId);
        if (!admin.isAdmin()) {
            throw new InvalidRequestException(ErrorCode.FORBIDDEN, "관리자만 처리할 수 있습니다.");
        }
        return admin;
    }

    private AdminNightRequest findRequest(String requestId) {
        return adminNightRequestRepository.findById(requestId)
                .orElseThrow(() -> new InvalidRequestException(ErrorCode.RESOURCE_NOT_FOUND, "Admin Night 신청을 찾을 수 없습니다."));
    }

    private void validateRequester(User user, AdminNightRequest request) {
        if (!request.getUserId().equals(user.getId())) {
            throw new InvalidRequestException(ErrorCode.FORBIDDEN, "본인 신청만 수정할 수 있습니다.");
        }
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
