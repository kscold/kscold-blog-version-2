package com.kscold.blog.identity.application.service;

import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.application.port.in.UserManagementUseCase;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.PasswordResetTokenRepository;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.identity.domain.port.out.UserSessionRevocationPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserManagementApplicationService implements UserManagementUseCase {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserSessionRevocationPort userSessionRevocationPort;

    @Override
    @Transactional
    public void softDelete(String userId) {
        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() -> ResourceNotFoundException.user(userId));
        passwordResetTokenRepository.deleteByUserId(userId);
        if (user.getDeletedAt() != null) {
            revokeUserSessionsSafely(userId);
            return;
        }
        if (userRepository.softDeleteIfActive(userId)) {
            revokeUserSessionsSafely(userId);
            log.info("Soft deleted user");
        }
    }

    @Override
    @Transactional
    public void hardDelete(String userId) {
        if (userRepository.findById(userId).isEmpty()) {
            throw ResourceNotFoundException.user(userId);
        }
        passwordResetTokenRepository.deleteByUserId(userId);
        userRepository.deleteById(userId);
        revokeUserSessionsSafely(userId);
        log.warn("Hard deleted user");
    }

    private void revokeUserSessionsSafely(String userId) {
        try {
            userSessionRevocationPort.revokeUserSessions(userId);
        } catch (RuntimeException exception) {
            log.warn(
                    "WebSocket session revocation skipped: type={}",
                    exception.getClass().getSimpleName());
        }
    }
}
