package com.kscold.blog.identity.application.service;

import com.kscold.blog.identity.domain.port.out.UserRepository;
import java.util.Locale;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.IntStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

enum AccountRecoveryAction {
    USERNAME_REMINDER,
    PASSWORD_RESET
}

/** 계정 조회부터 토큰 저장과 메일 전송까지 요청 스레드 밖에서 처리한다. */
@Slf4j
@Component
@RequiredArgsConstructor
class AccountRecoveryWorker {

    private static final int LOCK_STRIPE_COUNT = 64;

    private final UserRepository userRepository;
    private final AccountRecoveryMailService recoveryMailService;
    private final ReentrantLock[] recoveryLocks = createRecoveryLocks();

    boolean isMailAvailable() {
        return recoveryMailService.isAvailable();
    }

    void process(AccountRecoveryAction action, String email) {
        ReentrantLock recoveryLock = recoveryLockFor(email);
        recoveryLock.lock();
        try {
            userRepository
                    .findActiveByEmail(email)
                    .ifPresent(user -> recoveryMailService.send(action, user));
        } catch (Exception exception) {
            log.warn(
                    "계정 복구 작업을 완료하지 못했습니다: action={}, type={}",
                    action,
                    exception.getClass().getSimpleName());
        } finally {
            recoveryLock.unlock();
        }
    }

    private ReentrantLock recoveryLockFor(String email) {
        int hash = email.toLowerCase(Locale.ROOT).hashCode();
        int index = (hash ^ (hash >>> 16)) & (LOCK_STRIPE_COUNT - 1);
        return recoveryLocks[index];
    }

    private static ReentrantLock[] createRecoveryLocks() {
        return IntStream.range(0, LOCK_STRIPE_COUNT)
                .mapToObj(index -> new ReentrantLock())
                .toArray(ReentrantLock[]::new);
    }
}
