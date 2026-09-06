package com.kscold.blog.chat.adapter.in.ws;

import com.kscold.blog.identity.application.port.in.UserQueryPort;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;

@Slf4j
@Component
@RequiredArgsConstructor
class ChatSessionRegistry {

    private final UserQueryPort userQueryPort;
    private final Map<String, ChatSessionInfo> sessions = new ConcurrentHashMap<>();
    private final Map<String, RegistrationEpoch> registrationEpochs = new HashMap<>();
    private final Object registryLock = new Object();

    Optional<ValidatedChatSession> registerIfCurrent(ChatSessionInfo info) {
        long capturedEpoch = captureRegistrationEpoch(info.userId());
        Optional<UserQueryPort.AuthenticationInfo> current =
                findAuthenticationSafely(info.userId());
        boolean isValid = current.isPresent() && matchesSession(info, current.get());

        if (completeRegistration(info, capturedEpoch, isValid)) {
            return Optional.of(new ValidatedChatSession(info, current.orElseThrow()));
        }
        closeAndRemove(info);
        return Optional.empty();
    }

    Optional<ValidatedChatSession> validate(ChatSessionInfo info) {
        Optional<UserQueryPort.AuthenticationInfo> current =
                findAuthenticationSafely(info.userId());
        if (!isRegistered(info)) {
            return Optional.empty();
        }
        if (current.isPresent() && matchesSession(info, current.get())) {
            return Optional.of(new ValidatedChatSession(info, current.get()));
        }
        closeAndRemove(info);
        return Optional.empty();
    }

    List<ValidatedChatSession> validSnapshot() {
        List<ChatSessionInfo> snapshot;
        synchronized (registryLock) {
            snapshot = sessions.values().stream().toList();
        }
        Map<String, Optional<UserQueryPort.AuthenticationInfo>> users = new LinkedHashMap<>();
        return snapshot.stream()
                .map(info -> validateFromSnapshot(info, users))
                .flatMap(Optional::stream)
                .toList();
    }

    ChatSessionInfo get(String sessionId) {
        return sessions.get(sessionId);
    }

    ChatSessionInfo remove(String sessionId) {
        return sessions.remove(sessionId);
    }

    void revoke(String userId) {
        if (userId == null) return;
        try {
            List<ChatSessionInfo> revoked;
            synchronized (registryLock) {
                RegistrationEpoch epoch =
                        registrationEpochs.computeIfAbsent(
                                userId, ignored -> new RegistrationEpoch());
                epoch.value++;
                revoked =
                        sessions.values().stream()
                                .filter(info -> userId.equals(info.userId()))
                                .toList();
                revoked.forEach(info -> sessions.remove(info.session().getId(), info));
                removeUnusedEpoch(userId, epoch);
            }
            revoked.forEach(this::closeSession);
        } catch (Exception exception) {
            log.error(
                    "WebSocket session revocation failed: type={}",
                    exception.getClass().getSimpleName());
        }
    }

    private Optional<ValidatedChatSession> validateFromSnapshot(
            ChatSessionInfo info, Map<String, Optional<UserQueryPort.AuthenticationInfo>> users) {
        Optional<UserQueryPort.AuthenticationInfo> current =
                users.computeIfAbsent(info.userId(), this::findAuthenticationSafely);
        if (!isRegistered(info)) {
            return Optional.empty();
        }
        if (current.isPresent() && matchesSession(info, current.get())) {
            return Optional.of(new ValidatedChatSession(info, current.get()));
        }
        closeAndRemove(info);
        return Optional.empty();
    }

    private Optional<UserQueryPort.AuthenticationInfo> findAuthenticationSafely(String userId) {
        try {
            return userQueryPort.findAuthenticationById(userId);
        } catch (Exception exception) {
            log.warn(
                    "WebSocket session validation failed: type={}",
                    exception.getClass().getSimpleName());
            return Optional.empty();
        }
    }

    private boolean matchesSession(
            ChatSessionInfo info, UserQueryPort.AuthenticationInfo authentication) {
        return info.credentialVersion() == authentication.credentialVersion()
                && info.isAdmin() == authentication.isAdmin();
    }

    private long captureRegistrationEpoch(String userId) {
        synchronized (registryLock) {
            RegistrationEpoch epoch =
                    registrationEpochs.computeIfAbsent(userId, ignored -> new RegistrationEpoch());
            epoch.pendingRegistrations++;
            return epoch.value;
        }
    }

    private boolean completeRegistration(
            ChatSessionInfo info, long capturedEpoch, boolean isValid) {
        synchronized (registryLock) {
            RegistrationEpoch epoch = registrationEpochs.get(info.userId());
            boolean canRegister =
                    epoch != null && epoch.value == capturedEpoch && isValid && isOpen(info);
            if (canRegister) {
                sessions.put(info.session().getId(), info);
            }
            if (epoch != null) {
                epoch.pendingRegistrations--;
                removeUnusedEpoch(info.userId(), epoch);
            }
            return canRegister;
        }
    }

    private void removeUnusedEpoch(String userId, RegistrationEpoch epoch) {
        if (epoch.pendingRegistrations == 0) {
            registrationEpochs.remove(userId, epoch);
        }
    }

    private boolean isOpen(ChatSessionInfo info) {
        try {
            return info.session().isOpen();
        } catch (Exception exception) {
            return false;
        }
    }

    private boolean isRegistered(ChatSessionInfo info) {
        return sessions.get(info.session().getId()) == info;
    }

    private void closeAndRemove(ChatSessionInfo info) {
        sessions.remove(info.session().getId(), info);
        closeSession(info);
    }

    private void closeSession(ChatSessionInfo info) {
        try {
            if (info.session().isOpen()) {
                info.session().close(CloseStatus.POLICY_VIOLATION);
            }
        } catch (Exception exception) {
            log.warn(
                    "WebSocket session close failed: type={}",
                    exception.getClass().getSimpleName());
        }
    }

    private static final class RegistrationEpoch {
        private long value;
        private int pendingRegistrations;
    }
}
