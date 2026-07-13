package com.kscold.blog.adminnight.application.service;

import com.kscold.blog.adminnight.application.dto.AdminNightCreateCommand;
import com.kscold.blog.adminnight.application.dto.AdminNightDecisionCommand;
import com.kscold.blog.adminnight.application.dto.AdminNightProgramVoteCommand;
import com.kscold.blog.adminnight.application.port.in.AdminNightUseCase;
import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.adminnight.domain.port.out.AdminNightNotificationPort;
import com.kscold.blog.adminnight.domain.port.out.AdminNightProgramVoteRepository;
import com.kscold.blog.adminnight.domain.port.out.AdminNightRequestRepository;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AdminNightApplicationService implements AdminNightUseCase {

    private static final String ANONYMOUS_PRINCIPAL = "anonymousUser";

    private final AdminNightRequestRepository adminNightRequestRepository;
    private final AdminNightProgramVoteRepository adminNightProgramVoteRepository;
    private final UserRepository userRepository;
    private final UserQueryPort userQueryPort;
    private final AdminNightNotificationPort adminNightNotificationPort;
    private final AdminNightRequestDraftService adminNightRequestDraftService;
    private final AdminNightProgramVoteNormalizer adminNightProgramVoteNormalizer;

    @Override
    @Transactional
    public AdminNightRequest createRequest(String userId, AdminNightCreateCommand command) {
        User user = requireUser(userId);
        AdminNightRequest request =
                adminNightRequestDraftService.createPendingRequest(
                        user.getId(), user.getEmail(), command);

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
        return adminNightRequestRepository
                .findByStatusOrderByCreatedAtDesc(AdminNightRequest.Status.APPROVED)
                .stream()
                .filter(
                        request ->
                                request.getScheduledSlot() != null
                                        && request.getScheduledSlot().getDate() != null)
                .filter(request -> !request.getScheduledSlot().getDate().isBefore(from))
                .filter(request -> !request.getScheduledSlot().getDate().isAfter(to))
                .toList();
    }

    @Override
    @Transactional
    public AdminNightRequest resubmit(
            String requestId, String userId, AdminNightCreateCommand command) {
        User user = requireUser(userId);
        AdminNightRequest request = findRequest(requestId);
        validateRequester(user, request);

        if (request.getStatus() != AdminNightRequest.Status.INFO_REQUESTED) {
            throw InvalidRequestException.invalidInput("추가 정보 요청된 신청만 보완해서 다시 보낼 수 있습니다.");
        }

        adminNightRequestDraftService.applyResubmission(request, user.getEmail(), command);
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
    public AdminNightRequest approve(
            String requestId, String adminUserId, AdminNightDecisionCommand command) {
        UserQueryPort.UserInfo admin = requireAdmin(adminUserId);
        AdminNightRequest request = findRequest(requestId);

        if (request.getStatus() == AdminNightRequest.Status.REJECTED) {
            throw InvalidRequestException.invalidInput("거절된 신청은 다시 승인할 수 없습니다.");
        }

        request.setStatus(AdminNightRequest.Status.APPROVED);
        request.setScheduledSlot(adminNightRequestDraftService.resolveScheduledSlot(command));
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
    public AdminNightRequest requestMoreInfo(
            String requestId, String adminUserId, String reviewNote) {
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
        request.setReviewNote(adminNightRequestDraftService.requireReviewNote(reviewNote));
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
        request.setReviewNote(
                adminNightRequestDraftService.normalizeOptionalReviewNote(reviewNote));
        request.setDecidedAt(LocalDateTime.now());
        request.setDecidedByUserId(admin.id());
        request.setDecidedByName(admin.displayName());
        AdminNightRequest saved = adminNightRequestRepository.save(request);
        adminNightNotificationPort.notifyRequestRejected(saved);
        return saved;
    }

    @Override
    @Transactional
    public AdminNightProgramVote upsertProgramVote(
            String programKey, String userId, AdminNightProgramVoteCommand command) {
        String normalizedProgramKey =
                adminNightProgramVoteNormalizer.normalizeProgramKey(programKey);
        User user = findAuthenticatedUser(userId).orElse(null);
        String contactEmail =
                adminNightProgramVoteNormalizer.normalizeEmail(
                        command.contactEmail(), user != null ? user.getEmail() : null);
        Optional<AdminNightProgramVote> existingVote =
                user != null
                        ? adminNightProgramVoteRepository.findByProgramKeyAndUserId(
                                normalizedProgramKey, user.getId())
                        : Optional.empty();
        if (existingVote.isEmpty()) {
            existingVote =
                    adminNightProgramVoteRepository
                            .findByProgramKeyAndContactEmail(normalizedProgramKey, contactEmail)
                            .filter(vote -> user != null || !StringUtils.hasText(vote.getUserId()));
        }
        AdminNightProgramVote vote =
                existingVote.orElseGet(
                        () ->
                                AdminNightProgramVote.builder()
                                        .programKey(normalizedProgramKey)
                                        .build());

        vote.setProgramKey(normalizedProgramKey);
        vote.setUserId(user != null ? user.getId() : vote.getUserId());
        vote.setRequesterName(
                adminNightProgramVoteNormalizer.normalizeText(
                        command.requesterName(), "이름을 적어주세요."));
        vote.setRequesterEmail(user != null ? user.getEmail() : contactEmail);
        vote.setContactEmail(contactEmail);
        vote.setContact(adminNightProgramVoteNormalizer.normalizePhoneNumber(command.contact()));
        vote.setInterestLevel(
                adminNightProgramVoteNormalizer.requireInterestLevel(command.interestLevel()));
        vote.setPreferredFormat(
                adminNightProgramVoteNormalizer.requirePreferredFormat(command.preferredFormat()));
        vote.setExperienceLevel(
                adminNightProgramVoteNormalizer.requireExperienceLevel(command.experienceLevel()));
        vote.setSessionStyle(
                adminNightProgramVoteNormalizer.requireSessionStyle(command.sessionStyle()));
        vote.setSessionLength(
                adminNightProgramVoteNormalizer.requireSessionLength(command.sessionLength()));
        vote.setFoodPreference(
                adminNightProgramVoteNormalizer.requireFoodPreference(command.foodPreference()));
        vote.setPreferredDays(
                adminNightProgramVoteNormalizer.normalizePreferredDays(command.preferredDays()));
        vote.setPreferredTimes(
                adminNightProgramVoteNormalizer.normalizeRequiredList(
                        command.preferredTimes(), 8, "가능한 시간대를 하나 이상 골라주세요."));
        vote.setInterestedTopics(
                adminNightProgramVoteNormalizer.normalizeRequiredList(
                        command.interestedTopics(), 12, "듣고 싶은 주제를 하나 이상 골라주세요."));
        vote.setDesiredTakeaways(
                adminNightProgramVoteNormalizer.normalizeOptionalText(
                        command.desiredTakeaways(), 1000));
        vote.setMessage(
                adminNightProgramVoteNormalizer.normalizeOptionalText(command.message(), 1000));

        AdminNightProgramVote saved = adminNightProgramVoteRepository.save(vote);
        adminNightNotificationPort.notifyProgramVoteSubmitted(saved);
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AdminNightProgramVote> getMyProgramVote(String programKey, String userId) {
        String normalizedProgramKey =
                adminNightProgramVoteNormalizer.normalizeProgramKey(programKey);
        User user = requireUser(userId);
        return adminNightProgramVoteRepository.findByProgramKeyAndUserId(
                normalizedProgramKey, user.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminNightProgramVote> getProgramVotes(String programKey) {
        return adminNightProgramVoteRepository.findByProgramKeyOrderByCreatedAtDesc(
                adminNightProgramVoteNormalizer.normalizeProgramKey(programKey));
    }

    private User requireUser(String userId) {
        if (!hasAuthenticatedUserId(userId)) {
            throw InvalidRequestException.invalidInput("로그인이 필요합니다.");
        }

        return findAuthenticatedUser(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));
    }

    private Optional<User> findAuthenticatedUser(String userId) {
        if (!hasAuthenticatedUserId(userId)) {
            return Optional.empty();
        }
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw ResourceNotFoundException.user(userId);
        }
        return user;
    }

    private boolean hasAuthenticatedUserId(String userId) {
        return StringUtils.hasText(userId) && !ANONYMOUS_PRINCIPAL.equals(userId);
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
        return adminNightRequestRepository
                .findById(requestId)
                .orElseThrow(
                        () ->
                                new InvalidRequestException(
                                        ErrorCode.RESOURCE_NOT_FOUND,
                                        "Admin Night 신청을 찾을 수 없습니다."));
    }

    private void validateRequester(User user, AdminNightRequest request) {
        if (!request.getUserId().equals(user.getId())) {
            throw new InvalidRequestException(ErrorCode.FORBIDDEN, "본인 신청만 수정할 수 있습니다.");
        }
    }
}
