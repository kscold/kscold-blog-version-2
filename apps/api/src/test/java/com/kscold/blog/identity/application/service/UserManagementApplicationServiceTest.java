package com.kscold.blog.identity.application.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.PasswordResetTokenRepository;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.identity.domain.port.out.UserSessionRevocationPort;
import com.kscold.blog.support.UserFixtures;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UserManagementApplicationServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private UserSessionRevocationPort userSessionRevocationPort;

    @InjectMocks private UserManagementApplicationService userManagementApplicationService;

    @Test
    @DisplayName("시나리오: 계정을 탈퇴하면 비밀번호 재설정 토큰도 폐기한다")
    void softDeleteRevokesPasswordResetToken() {
        User user = activeUser();
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(userRepository.softDeleteIfActive("user-1")).thenReturn(true);

        userManagementApplicationService.softDelete("user-1");

        verify(passwordResetTokenRepository).deleteByUserId("user-1");
        verify(userRepository).softDeleteIfActive("user-1");
        verify(userRepository, never()).save(user);
        verify(userSessionRevocationPort).revokeUserSessions("user-1");
    }

    @Test
    @DisplayName("시나리오: 이미 탈퇴한 계정도 남은 재설정 토큰을 폐기한다")
    void repeatedSoftDeleteRevokesLegacyToken() {
        User user = activeUser();
        user.setDeletedAt(LocalDateTime.now());
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        userManagementApplicationService.softDelete("user-1");

        verify(passwordResetTokenRepository).deleteByUserId("user-1");
        verify(userRepository, never()).softDeleteIfActive("user-1");
        verify(userRepository, never()).save(user);
        verify(userSessionRevocationPort).revokeUserSessions("user-1");
    }

    @Test
    @DisplayName("시나리오: 계정을 영구 삭제하면 비밀번호 재설정 토큰도 폐기한다")
    void hardDeleteRevokesPasswordResetToken() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(activeUser()));

        userManagementApplicationService.hardDelete("user-1");

        verify(passwordResetTokenRepository).deleteByUserId("user-1");
        verify(userRepository).deleteById("user-1");
        verify(userSessionRevocationPort).revokeUserSessions("user-1");
    }

    @Test
    @DisplayName("시나리오: 연결 폐기 실패가 소프트 삭제 성공을 오염시키지 않는다")
    void softDeleteCompletesWhenSessionRevocationFails() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(activeUser()));
        when(userRepository.softDeleteIfActive("user-1")).thenReturn(true);
        doThrow(new IllegalStateException("revocation failed"))
                .when(userSessionRevocationPort)
                .revokeUserSessions("user-1");

        assertDoesNotThrow(() -> userManagementApplicationService.softDelete("user-1"));

        verify(userRepository).softDeleteIfActive("user-1");
    }

    @Test
    @DisplayName("시나리오: 연결 폐기 실패가 영구 삭제 성공을 오염시키지 않는다")
    void hardDeleteCompletesWhenSessionRevocationFails() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(activeUser()));
        doThrow(new IllegalStateException("revocation failed"))
                .when(userSessionRevocationPort)
                .revokeUserSessions("user-1");

        assertDoesNotThrow(() -> userManagementApplicationService.hardDelete("user-1"));

        verify(userRepository).deleteById("user-1");
    }

    @Test
    @DisplayName("시나리오: 영구 삭제가 실패하면 연결을 폐기하지 않는다")
    void hardDeleteFailureDoesNotRevokeSessions() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(activeUser()));
        doThrow(new IllegalStateException("delete failed"))
                .when(userRepository)
                .deleteById("user-1");

        assertThatThrownBy(() -> userManagementApplicationService.hardDelete("user-1"))
                .isInstanceOf(IllegalStateException.class);

        verify(userSessionRevocationPort, never()).revokeUserSessions("user-1");
    }

    @Test
    @DisplayName("시나리오: 존재하지 않는 계정의 탈퇴 요청은 기존처럼 실패한다")
    void softDeleteRejectsMissingUser() {
        when(userRepository.findById("missing-user")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userManagementApplicationService.softDelete("missing-user"))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(passwordResetTokenRepository, never()).deleteByUserId("missing-user");
        verify(userRepository, never()).softDeleteIfActive("missing-user");
        verify(userSessionRevocationPort, never()).revokeUserSessions("missing-user");
    }

    @Test
    @DisplayName("시나리오: 조회 직후 이미 탈퇴된 계정은 다른 필드를 덮지 않는다")
    void softDeleteIgnoresConcurrentDeletion() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(activeUser()));
        when(userRepository.softDeleteIfActive("user-1")).thenReturn(false);

        userManagementApplicationService.softDelete("user-1");

        verify(passwordResetTokenRepository).deleteByUserId("user-1");
        verify(userRepository, never()).save(any());
        verify(userSessionRevocationPort, never()).revokeUserSessions("user-1");
    }

    private User activeUser() {
        return UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
    }
}
