package com.kscold.blog.identity.application.service;

import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.identity.domain.port.out.UserSessionRevocationPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** 활성 계정의 비밀번호와 자격 버전을 원자 갱신하고 기존 세션을 폐기한다. */
@Slf4j
@Component
@RequiredArgsConstructor
class PasswordCredentialService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserSessionRevocationPort userSessionRevocationPort;

    boolean update(String userId, String newPassword) {
        String encodedPassword = passwordEncoder.encode(newPassword);
        if (!userRepository.updatePasswordIfActive(userId, encodedPassword)) {
            return false;
        }
        revokeUserSessionsSafely(userId);
        return true;
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
