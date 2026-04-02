package com.kscold.blog.guestbook.application.service;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.guestbook.application.dto.GuestbookEntryCreateCommand;
import com.kscold.blog.guestbook.domain.model.GuestbookEntry;
import com.kscold.blog.guestbook.domain.port.out.GuestbookRepository;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.support.UserFixtures;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GuestbookApplicationServiceTest {

    @Mock
    private GuestbookRepository guestbookRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private GuestbookApplicationService guestbookApplicationService;

    @Test
    @DisplayName("시나리오: 로그인한 사용자는 자신의 표시 이름으로 방명록을 남길 수 있다")
    void createUsesAuthenticatedUserProfile() {
        User user = UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(guestbookRepository.save(any(GuestbookEntry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GuestbookEntry saved = guestbookApplicationService.create(
                new GuestbookEntryCreateCommand("반갑습니다. 잘 보고 갑니다."),
                "user-1"
        );

        assertThat(saved.getAuthorName()).isEqualTo("김승찬");
        assertThat(saved.getUserId()).isEqualTo("user-1");
        assertThat(saved.getAuthorRole()).isEqualTo(User.Role.USER);
        assertThat(saved.getContent()).isEqualTo("반갑습니다. 잘 보고 갑니다.");
    }

    @Test
    @DisplayName("시나리오: 작성자는 자신이 남긴 방명록을 직접 삭제할 수 있다")
    void deleteAllowsOwner() {
        User owner = UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
        GuestbookEntry entry = GuestbookEntry.builder()
                .id("entry-1")
                .userId("user-1")
                .authorName("김승찬")
                .authorRole(User.Role.USER)
                .content("hello")
                .build();
        when(userRepository.findById("user-1")).thenReturn(Optional.of(owner));
        when(guestbookRepository.findById("entry-1")).thenReturn(Optional.of(entry));

        guestbookApplicationService.delete("entry-1", "user-1");

        verify(guestbookRepository).delete(entry);
    }

    @Test
    @DisplayName("시나리오: 관리자는 다른 사용자의 방명록도 삭제할 수 있다")
    void deleteAllowsAdmin() {
        User admin = UserFixtures.user("admin-1", User.Role.ADMIN, "admin", "관리자");
        GuestbookEntry entry = GuestbookEntry.builder()
                .id("entry-1")
                .userId("user-2")
                .authorName("누군가")
                .authorRole(User.Role.USER)
                .content("hello")
                .build();
        when(userRepository.findById("admin-1")).thenReturn(Optional.of(admin));
        when(guestbookRepository.findById("entry-1")).thenReturn(Optional.of(entry));

        guestbookApplicationService.delete("entry-1", "admin-1");

        verify(guestbookRepository).delete(entry);
    }

    @Test
    @DisplayName("시나리오: 작성자도 관리자도 아닌 사용자는 다른 사람의 방명록을 삭제할 수 없다")
    void deleteRejectsNonOwner() {
        User user = UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
        GuestbookEntry entry = GuestbookEntry.builder()
                .id("entry-1")
                .userId("user-2")
                .authorName("누군가")
                .authorRole(User.Role.USER)
                .content("hello")
                .build();
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(guestbookRepository.findById("entry-1")).thenReturn(Optional.of(entry));

        assertThatThrownBy(() -> guestbookApplicationService.delete("entry-1", "user-1"))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("본인이 작성한 방명록만 삭제할 수 있습니다");

        verify(guestbookRepository, never()).delete(any());
    }

    @Test
    @DisplayName("시나리오: 로그인 정보가 없으면 방명록 작성이 거절된다")
    void createRejectsAnonymousUser() {
        assertThatThrownBy(() -> guestbookApplicationService.create(new GuestbookEntryCreateCommand("안녕하세요"), null))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("로그인이 필요합니다");

        verify(guestbookRepository, never()).save(any());
    }
}
