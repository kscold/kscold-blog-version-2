package com.kscold.blog.identity.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.kscold.blog.identity.domain.model.PasswordResetToken;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.PasswordResetSettings;
import com.kscold.blog.identity.domain.port.out.PasswordResetTokenRepository;
import com.kscold.blog.identity.domain.port.out.RecoveryMailComposer;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.notification.domain.model.MailMessage;
import com.kscold.blog.notification.domain.port.out.MailSender;
import com.kscold.blog.notification.domain.port.out.PublicUrlResolver;
import com.kscold.blog.support.UserFixtures;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;

class PasswordResetIssuanceConcurrencyTest {

    @Test
    void concurrentRequestsForSameEmailLeaveOnlyTheLatestToken() throws Exception {
        User user = UserFixtures.user("user-1", User.Role.USER, "alpha", "사용자");
        UserRepository userRepository = mock(UserRepository.class);
        when(userRepository.findActiveByEmail(user.getEmail())).thenReturn(Optional.of(user));
        InMemoryTokenRepository tokenRepository = new InMemoryTokenRepository();
        MailSendGate mailSendGate = new MailSendGate();
        AccountRecoveryWorker worker = createWorker(userRepository, tokenRepository, mailSendGate);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        StartGate startGate = new StartGate();
        RecoveryRequest request = new RecoveryRequest(worker, user.getEmail(), startGate);
        Future<?> first = submit(executor, request);
        Future<?> second = submit(executor, request);

        try {
            startGate.releaseTogether();
            mailSendGate.awaitFirstDelivery();
            assertThat(tokenRepository.issuedCount()).isOne();
            mailSendGate.releaseFirstDelivery();
            first.get(1, TimeUnit.SECONDS);
            second.get(1, TimeUnit.SECONDS);
            assertThat(tokenRepository.issuedCount()).isEqualTo(2);
            assertThat(tokenRepository.size()).isOne();
        } finally {
            mailSendGate.releaseFirstDelivery();
            first.cancel(true);
            second.cancel(true);
            executor.shutdownNow();
        }
    }

    private AccountRecoveryWorker createWorker(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            MailSendGate mailSendGate) {
        MailSender mailSender = mock(MailSender.class);
        RecoveryMailComposer mailComposer = mock(RecoveryMailComposer.class);
        PublicUrlResolver urlResolver = mock(PublicUrlResolver.class);
        PasswordResetSettings settings = mock(PasswordResetSettings.class);
        when(settings.getPasswordResetExpiryMinutes()).thenReturn(30L);
        when(urlResolver.resolvePublicUrl(anyString())).thenReturn("https://kscold.com/reset");
        when(mailComposer.buildPasswordReset(any(User.class), anyString()))
                .thenAnswer(
                        invocation ->
                                new MailMessage(
                                        ((User) invocation.getArgument(0)).getEmail(),
                                        "재설정",
                                        "plain",
                                        "html"));
        doAnswer(
                        invocation -> {
                            mailSendGate.recordDelivery();
                            return null;
                        })
                .when(mailSender)
                .send(any(MailMessage.class));
        PasswordResetTokenIssuer issuer =
                new PasswordResetTokenIssuer(tokenRepository, urlResolver, settings);
        AccountRecoveryMailService mailService =
                new AccountRecoveryMailService(mailSender, mailComposer, issuer);
        return new AccountRecoveryWorker(userRepository, mailService);
    }

    private Future<?> submit(ExecutorService executor, RecoveryRequest request) {
        return executor.submit(
                () -> {
                    request.startGate().awaitStart();
                    request.worker().process(AccountRecoveryAction.PASSWORD_RESET, request.email());
                    return null;
                });
    }

    private record RecoveryRequest(
            AccountRecoveryWorker worker, String email, StartGate startGate) {}

    private static final class StartGate {

        private final CountDownLatch ready = new CountDownLatch(2);
        private final CountDownLatch start = new CountDownLatch(1);

        void awaitStart() throws InterruptedException {
            ready.countDown();
            start.await(1, TimeUnit.SECONDS);
        }

        void releaseTogether() throws InterruptedException {
            assertThat(ready.await(1, TimeUnit.SECONDS)).isTrue();
            start.countDown();
        }
    }

    private static final class MailSendGate {

        private final CountDownLatch firstDelivery = new CountDownLatch(1);
        private final CountDownLatch release = new CountDownLatch(1);
        private final AtomicInteger sequence = new AtomicInteger();

        void recordDelivery() throws InterruptedException {
            if (sequence.incrementAndGet() == 1) {
                firstDelivery.countDown();
                release.await(2, TimeUnit.SECONDS);
            }
        }

        void awaitFirstDelivery() throws InterruptedException {
            assertThat(firstDelivery.await(1, TimeUnit.SECONDS)).isTrue();
        }

        void releaseFirstDelivery() {
            release.countDown();
        }
    }

    private static final class InMemoryTokenRepository implements PasswordResetTokenRepository {

        private final List<PasswordResetToken> tokens = new CopyOnWriteArrayList<>();
        private final AtomicInteger issuedCount = new AtomicInteger();

        @Override
        public PasswordResetToken save(PasswordResetToken token) {
            tokens.add(token);
            issuedCount.incrementAndGet();
            return token;
        }

        @Override
        public Optional<PasswordResetToken> findByTokenHash(String tokenHash) {
            return tokens.stream()
                    .filter(token -> tokenHash.equals(token.getTokenHash()))
                    .findFirst();
        }

        @Override
        public Optional<PasswordResetToken> consumeByTokenHash(String tokenHash) {
            Optional<PasswordResetToken> token = findByTokenHash(tokenHash);
            token.ifPresent(tokens::remove);
            return token;
        }

        @Override
        public void deleteByUserId(String userId) {
            tokens.removeIf(token -> userId.equals(token.getUserId()));
        }

        int size() {
            return tokens.size();
        }

        int issuedCount() {
            return issuedCount.get();
        }
    }
}
