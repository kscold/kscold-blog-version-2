package com.kscold.blog.guestbook.application.service;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.guestbook.application.dto.command.GuestbookEntryCreateCommand;
import com.kscold.blog.guestbook.application.dto.command.GuestbookReplyCommand;
import com.kscold.blog.guestbook.application.port.in.GuestbookUseCase;
import com.kscold.blog.guestbook.domain.model.GuestbookEntry;
import com.kscold.blog.guestbook.domain.port.out.GuestbookRepository;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.notification.application.port.in.NotificationUseCase;
import com.kscold.blog.notification.domain.model.NotificationChannel;
import com.kscold.blog.notification.domain.model.NotificationMessage;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class GuestbookApplicationService implements GuestbookUseCase {

    private final GuestbookRepository guestbookRepository;
    private final UserRepository userRepository;
    private final NotificationUseCase notificationUseCase;

    @Override
    @Transactional(readOnly = true)
    public Page<GuestbookEntry> getEntries(Pageable pageable) {
        return guestbookRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public GuestbookEntry create(GuestbookEntryCreateCommand command, String userId) {
        User user = getAuthenticatedUser(userId);

        GuestbookEntry entry =
                GuestbookEntry.builder()
                        .authorName(user.getDisplayName())
                        .userId(user.getId())
                        .authorRole(user.getRole())
                        .content(command.getContent())
                        .build();

        GuestbookEntry saved = guestbookRepository.save(entry);
        notifyNewEntry(saved);
        return saved;
    }

    @Override
    @Transactional
    public GuestbookEntry reply(String entryId, GuestbookReplyCommand command, String adminUserId) {
        User admin = getAuthenticatedUser(adminUserId);
        if (admin.getRole() != User.Role.ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "방명록 답글은 블로그 주인만 남길 수 있습니다");
        }

        GuestbookEntry entry =
                guestbookRepository
                        .findById(entryId)
                        .orElseThrow(() -> ResourceNotFoundException.guestbookEntry(entryId));

        entry.setReply(
                GuestbookEntry.GuestbookReply.builder()
                        .content(command.getContent())
                        .repliedAt(LocalDateTime.now())
                        .build());

        return guestbookRepository.save(entry);
    }

    /** 새 방명록 작성을 디스코드 알림 채널로 알림. 실패해도 작성 자체는 성공해야 하므로 예외를 삼킨다. */
    private void notifyNewEntry(GuestbookEntry entry) {
        try {
            notificationUseCase.notify(
                    new NotificationMessage(
                            NotificationChannel.GUESTBOOK,
                            "새 방명록이 달렸어요",
                            entry.getContent(),
                            List.of(new NotificationMessage.Field("작성자", entry.getAuthorName()))));
        } catch (Exception exception) {
            log.warn("방명록 알림 전송을 건너뜁니다. entryId={}", entry.getId(), exception);
        }
    }

    @Override
    @Transactional
    public void delete(String entryId, String currentUserId) {
        User user = getAuthenticatedUser(currentUserId);

        GuestbookEntry entry =
                guestbookRepository
                        .findById(entryId)
                        .orElseThrow(() -> ResourceNotFoundException.guestbookEntry(entryId));

        boolean canDelete =
                user.getRole() == User.Role.ADMIN || user.getId().equals(entry.getUserId());
        if (!canDelete) {
            throw InvalidRequestException.invalidInput("본인이 작성한 방명록만 삭제할 수 있습니다");
        }

        guestbookRepository.delete(entry);
    }

    private User getAuthenticatedUser(String userId) {
        if (userId == null || userId.isBlank()) {
            throw InvalidRequestException.invalidInput("로그인이 필요합니다");
        }

        return userRepository
                .findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));
    }
}
