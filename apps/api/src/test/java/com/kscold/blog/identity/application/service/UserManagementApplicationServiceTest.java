package com.kscold.blog.identity.application.service;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.PasswordResetTokenRepository;
import com.kscold.blog.identity.domain.port.out.UserRepository;
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

    @InjectMocks private UserManagementApplicationService userManagementApplicationService;

    @Test
    @DisplayName("시나리오: 계정을 탈퇴하면 비밀번호 재설정 토큰도 폐기한다")
    void softDeleteRevokesPasswordResetToken() {
        User user = activeUser();
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        userManagementApplicationService.softDelete("user-1");

        verify(passwordResetTokenRepository).deleteByUserId("user-1");
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("시나리오: 이미 탈퇴한 계정도 남은 재설정 토큰을 폐기한다")
    void repeatedSoftDeleteRevokesLegacyToken() {
        User user = activeUser();
        user.setDeletedAt(LocalDateTime.now());
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        userManagementApplicationService.softDelete("user-1");

        verify(passwordResetTokenRepository).deleteByUserId("user-1");
        verify(userRepository, never()).save(user);
    }

    @Test
    @DisplayName("시나리오: 계정을 영구 삭제하면 비밀번호 재설정 토큰도 폐기한다")
    void hardDeleteRevokesPasswordResetToken() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(activeUser()));

        userManagementApplicationService.hardDelete("user-1");

        verify(passwordResetTokenRepository).deleteByUserId("user-1");
        verify(userRepository).deleteById("user-1");
    }

    private User activeUser() {
        return UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
    }
}
