package com.kscold.blog.adminnight.application.service;

import com.kscold.blog.adminnight.application.dto.AdminNightCreateCommand;
import com.kscold.blog.adminnight.application.dto.AdminNightDecisionCommand;
import com.kscold.blog.adminnight.application.dto.AdminNightProgramVoteCommand;
import com.kscold.blog.adminnight.application.port.in.AdminNightUseCase;
import com.kscold.blog.adminnight.application.port.out.AdminNightNotificationPort;
import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import com.kscold.blog.adminnight.domain.port.out.AdminNightProgramVoteRepository;
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
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AdminNightApplicationService implements AdminNightUseCase {

    private static final Pattern PROGRAM_KEY_PATTERN = Pattern.compile("^[a-z0-9][a-z0-9-]{1,80}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final String ANONYMOUS_PRINCIPAL = "anonymousUser";

    private final AdminNightRequestRepository adminNightRequestRepository;
    private final AdminNightProgramVoteRepository adminNightProgramVoteRepository;
    private final UserRepository userRepository;
    private final UserQueryPort userQueryPort;
    private final AdminNightNotificationPort adminNightNotificationPort;
    private final AdminNightRequestDraftService adminNightRequestDraftService;

    @Override
    @Transactional
    public AdminNightRequest createRequest(String userId, AdminNightCreateCommand command) {
        User user = requireUser(userId);
        AdminNightRequest request = adminNightRequestDraftService.createPendingRequest(user.getId(), user.getEmail(), command);

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
    public AdminNightRequest approve(String requestId, String adminUserId, AdminNightDecisionCommand command) {
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
        request.setReviewNote(adminNightRequestDraftService.normalizeOptionalReviewNote(reviewNote));
        request.setDecidedAt(LocalDateTime.now());
        request.setDecidedByUserId(admin.id());
        request.setDecidedByName(admin.displayName());
        AdminNightRequest saved = adminNightRequestRepository.save(request);
        adminNightNotificationPort.notifyRequestRejected(saved);
        return saved;
    }

    @Override
    @Transactional
    public AdminNightProgramVote upsertProgramVote(String programKey, String userId, AdminNightProgramVoteCommand command) {
        String normalizedProgramKey = normalizeProgramKey(programKey);
        User user = findAuthenticatedUser(userId).orElse(null);
        String contactEmail = normalizeEmail(command.contactEmail(), user != null ? user.getEmail() : null);
        Optional<AdminNightProgramVote> existingVote = user != null
                ? adminNightProgramVoteRepository.findByProgramKeyAndUserId(normalizedProgramKey, user.getId())
                : Optional.empty();
        if (existingVote.isEmpty()) {
            existingVote = adminNightProgramVoteRepository
                    .findByProgramKeyAndContactEmail(normalizedProgramKey, contactEmail)
                    .filter(vote -> user != null || !StringUtils.hasText(vote.getUserId()));
        }
        AdminNightProgramVote vote = existingVote.orElseGet(() -> AdminNightProgramVote.builder()
                .programKey(normalizedProgramKey)
                .build());

        vote.setProgramKey(normalizedProgramKey);
        vote.setUserId(user != null ? user.getId() : vote.getUserId());
        vote.setRequesterName(normalizeText(command.requesterName(), "이름을 적어주세요."));
        vote.setRequesterEmail(user != null ? user.getEmail() : contactEmail);
        vote.setContactEmail(contactEmail);
        vote.setContact(normalizeRequiredText(command.contact(), "연락처를 적어주세요.", 120, "연락처는 120자를 넘길 수 없습니다."));
        vote.setInterestLevel(requireInterestLevel(command.interestLevel()));
        vote.setPreferredFormat(requirePreferredFormat(command.preferredFormat()));
        vote.setExperienceLevel(requireExperienceLevel(command.experienceLevel()));
        vote.setSessionStyle(requireSessionStyle(command.sessionStyle()));
        vote.setSessionLength(requireSessionLength(command.sessionLength()));
        vote.setFoodPreference(requireFoodPreference(command.foodPreference()));
        vote.setPreferredDays(normalizePreferredDays(command.preferredDays()));
        vote.setPreferredTimes(normalizeList(command.preferredTimes(), 8));
        vote.setInterestedTopics(normalizeList(command.interestedTopics(), 12));
        vote.setDesiredTakeaways(normalizeRequiredText(
                command.desiredTakeaways(),
                "얻어가고 싶은 내용을 적어주세요.",
                1000,
                "얻어가고 싶은 내용이 너무 깁니다."
        ));
        vote.setMessage(normalizeOptionalText(command.message(), 1000));

        AdminNightProgramVote saved = adminNightProgramVoteRepository.save(vote);
        adminNightNotificationPort.notifyProgramVoteSubmitted(saved);
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AdminNightProgramVote> getMyProgramVote(String programKey, String userId) {
        String normalizedProgramKey = normalizeProgramKey(programKey);
        User user = requireUser(userId);
        return adminNightProgramVoteRepository.findByProgramKeyAndUserId(normalizedProgramKey, user.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminNightProgramVote> getProgramVotes(String programKey) {
        return adminNightProgramVoteRepository.findByProgramKeyOrderByCreatedAtDesc(normalizeProgramKey(programKey));
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
        return adminNightRequestRepository.findById(requestId)
                .orElseThrow(() -> new InvalidRequestException(ErrorCode.RESOURCE_NOT_FOUND, "Admin Night 신청을 찾을 수 없습니다."));
    }

    private void validateRequester(User user, AdminNightRequest request) {
        if (!request.getUserId().equals(user.getId())) {
            throw new InvalidRequestException(ErrorCode.FORBIDDEN, "본인 신청만 수정할 수 있습니다.");
        }
    }

    private String normalizeProgramKey(String programKey) {
        if (!StringUtils.hasText(programKey) || !PROGRAM_KEY_PATTERN.matcher(programKey).matches()) {
            throw InvalidRequestException.invalidInput("프로그램 키가 올바르지 않습니다.");
        }
        return programKey.trim().toLowerCase();
    }

    private AdminNightProgramVote.InterestLevel requireInterestLevel(AdminNightProgramVote.InterestLevel interestLevel) {
        if (interestLevel == null) {
            throw InvalidRequestException.invalidInput("참여 의향을 골라주세요.");
        }
        return interestLevel;
    }

    private AdminNightProgramVote.PreferredFormat requirePreferredFormat(AdminNightProgramVote.PreferredFormat preferredFormat) {
        if (preferredFormat == null) {
            throw InvalidRequestException.invalidInput("선호 진행 방식을 골라주세요.");
        }
        return preferredFormat;
    }

    private AdminNightProgramVote.ExperienceLevel requireExperienceLevel(AdminNightProgramVote.ExperienceLevel experienceLevel) {
        if (experienceLevel == null) {
            throw InvalidRequestException.invalidInput("현재 경험 수준을 골라주세요.");
        }
        return experienceLevel;
    }

    private AdminNightProgramVote.SessionStyle requireSessionStyle(AdminNightProgramVote.SessionStyle sessionStyle) {
        return sessionStyle != null ? sessionStyle : AdminNightProgramVote.SessionStyle.MIXED;
    }

    private AdminNightProgramVote.SessionLength requireSessionLength(AdminNightProgramVote.SessionLength sessionLength) {
        return sessionLength != null ? sessionLength : AdminNightProgramVote.SessionLength.STANDARD_120;
    }

    private AdminNightProgramVote.FoodPreference requireFoodPreference(AdminNightProgramVote.FoodPreference foodPreference) {
        return foodPreference != null ? foodPreference : AdminNightProgramVote.FoodPreference.LIGHT_SNACK;
    }

    private List<AdminNightProgramVote.PreferredDay> normalizePreferredDays(List<AdminNightProgramVote.PreferredDay> values) {
        if (values == null || values.isEmpty()) {
            return List.of(AdminNightProgramVote.PreferredDay.SATURDAY, AdminNightProgramVote.PreferredDay.SUNDAY);
        }

        LinkedHashSet<AdminNightProgramVote.PreferredDay> normalized = new LinkedHashSet<>();
        for (AdminNightProgramVote.PreferredDay value : values) {
            if (value == null) {
                continue;
            }
            normalized.add(value);
            if (normalized.size() > 3) {
                throw InvalidRequestException.invalidInput("희망 요일은 금·토·일 안에서 골라주세요.");
            }
        }
        if (normalized.isEmpty()) {
            throw InvalidRequestException.invalidInput("희망 요일을 골라주세요.");
        }
        return List.copyOf(normalized);
    }

    private String normalizeEmail(String value, String fallbackEmail) {
        String email = StringUtils.hasText(value) ? value.trim() : fallbackEmail;
        if (!StringUtils.hasText(email) || !EMAIL_PATTERN.matcher(email).matches()) {
            throw InvalidRequestException.invalidInput("안내를 받을 이메일을 올바르게 적어주세요.");
        }
        if (email.length() > 120) {
            throw InvalidRequestException.invalidInput("이메일은 120자를 넘길 수 없습니다.");
        }
        return email;
    }

    private List<String> normalizeList(List<String> values, int maxSize) {
        if (values == null) {
            return List.of();
        }

        LinkedHashSet<String> normalized = new LinkedHashSet<>();
        for (String value : values) {
            if (!StringUtils.hasText(value)) {
                continue;
            }
            String item = value.trim();
            if (item.length() > 80) {
                throw InvalidRequestException.invalidInput("선택 항목은 80자를 넘길 수 없습니다.");
            }
            normalized.add(item);
            if (normalized.size() > maxSize) {
                throw InvalidRequestException.invalidInput("선택 항목이 너무 많습니다.");
            }
        }
        return List.copyOf(normalized);
    }

    private String normalizeText(String value, String message) {
        if (!StringUtils.hasText(value)) {
            throw InvalidRequestException.invalidInput(message);
        }
        String normalized = value.trim();
        if (normalized.length() > 80) {
            throw InvalidRequestException.invalidInput("이름은 80자를 넘길 수 없습니다.");
        }
        return normalized;
    }

    private String normalizeRequiredText(String value, String message, int maxLength, String maxLengthMessage) {
        if (!StringUtils.hasText(value)) {
            throw InvalidRequestException.invalidInput(message);
        }
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw InvalidRequestException.invalidInput(maxLengthMessage);
        }
        return normalized;
    }

    private String normalizeOptionalText(String value, int maxLength) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw InvalidRequestException.invalidInput("메시지가 너무 깁니다.");
        }
        return normalized;
    }
}
