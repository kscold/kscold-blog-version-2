package com.kscold.blog.guestbook.application.service;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.guestbook.application.dto.GuestbookEntryCreateCommand;
import com.kscold.blog.guestbook.application.port.in.GuestbookUseCase;
import com.kscold.blog.guestbook.domain.model.GuestbookEntry;
import com.kscold.blog.guestbook.domain.port.out.GuestbookRepository;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
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

    @Override
    @Transactional(readOnly = true)
    public Page<GuestbookEntry> getEntries(Pageable pageable) {
        return guestbookRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public GuestbookEntry create(GuestbookEntryCreateCommand command, String userId) {
        User user = getAuthenticatedUser(userId);

        GuestbookEntry entry = GuestbookEntry.builder()
                .authorName(user.getDisplayName())
                .userId(user.getId())
                .authorRole(user.getRole())
                .content(command.getContent())
                .build();

        return guestbookRepository.save(entry);
    }

    @Override
    @Transactional
    public void delete(String entryId, String currentUserId) {
        User user = getAuthenticatedUser(currentUserId);

        GuestbookEntry entry = guestbookRepository.findById(entryId)
                .orElseThrow(() -> ResourceNotFoundException.guestbookEntry(entryId));

        boolean canDelete = user.getRole() == User.Role.ADMIN || user.getId().equals(entry.getUserId());
        if (!canDelete) {
            throw InvalidRequestException.invalidInput("본인이 작성한 방명록만 삭제할 수 있습니다");
        }

        guestbookRepository.delete(entry);
    }

    private User getAuthenticatedUser(String userId) {
        if (userId == null || userId.isBlank()) {
            throw InvalidRequestException.invalidInput("로그인이 필요합니다");
        }

        return userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));
    }
}
