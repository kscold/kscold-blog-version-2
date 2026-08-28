package com.kscold.blog.stackshare.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.notification.application.port.in.AlimtalkTemplateUseCase;
import com.kscold.blog.notification.domain.model.AlimtalkTemplate;
import com.kscold.blog.notification.domain.model.AlimtalkTemplateStatus;
import com.kscold.blog.stackshare.application.dto.SendStackShareNotificationsCommand;
import com.kscold.blog.stackshare.application.dto.StackShareRecipientCommand;
import com.kscold.blog.stackshare.application.dto.StackShareSettlementCommand;
import com.kscold.blog.stackshare.domain.model.StackShareAccount;
import com.kscold.blog.stackshare.domain.model.StackShareMessage;
import com.kscold.blog.stackshare.domain.model.StackShareParticipant;
import com.kscold.blog.stackshare.domain.model.StackShareSendResult;
import com.kscold.blog.stackshare.domain.port.out.StackShareAccountRepository;
import com.kscold.blog.stackshare.domain.port.out.StackShareNotificationSender;
import com.kscold.blog.stackshare.domain.port.out.StackShareParticipantRepository;
import com.kscold.blog.stackshare.domain.port.out.StackShareSettlementRepository;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class StackShareManagementApplicationServiceTest {

    private StackShareParticipantRepository participantRepository;
    private StackShareSettlementRepository settlementRepository;
    private StackShareAccountRepository accountRepository;
    private StackShareNotificationSender notificationSender;
    private AlimtalkTemplateUseCase templateUseCase;
    private StackShareManagementApplicationService service;

    @BeforeEach
    void setUp() {
        participantRepository = mock(StackShareParticipantRepository.class);
        settlementRepository = mock(StackShareSettlementRepository.class);
        accountRepository = mock(StackShareAccountRepository.class);
        notificationSender = mock(StackShareNotificationSender.class);
        templateUseCase = mock(AlimtalkTemplateUseCase.class);
        service =
                new StackShareManagementApplicationService(
                        participantRepository,
                        settlementRepository,
                        accountRepository,
                        notificationSender,
                        templateUseCase);
        when(accountRepository.find()).thenReturn(Optional.of(registeredAccount()));
    }

    private StackShareAccount registeredAccount() {
        return StackShareAccount.builder()
                .bankName("토스뱅크")
                .accountNumber("1000-1234-5678")
                .accountHolder("김승찬")
                .contactPhone("01012345678")
                .build();
    }

    @Test
    void 총액을_원단위까지_나누고_참여자를_저장한_뒤_발송한다() {
        AtomicInteger sequence = new AtomicInteger();
        when(templateUseCase.getTemplate("STACK_SHARE_SETTLEMENT")).thenReturn(approvedTemplate());
        when(participantRepository.findByPhoneNumber(any())).thenReturn(Optional.empty());
        when(participantRepository.save(any()))
                .thenAnswer(
                        invocation -> {
                            StackShareParticipant participant = invocation.getArgument(0);
                            participant.setId("participant-" + sequence.incrementAndGet());
                            return participant;
                        });
        when(settlementRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(notificationSender.send(any())).thenReturn(new StackShareSendResult("group-id", 3, 3));

        service.createAndSend(command(100_000));

        ArgumentCaptor<List<StackShareMessage>> captor = ArgumentCaptor.forClass(List.class);
        verify(notificationSender).send(captor.capture());
        assertThat(captor.getValue())
                .extracting(message -> message.variables().get("#{분담금}"))
                .containsExactly("33,334원", "33,333원", "33,333원");
    }

    @Test
    void 등록된_입금계좌와_기한이_알림톡_변수로_들어간다() {
        stubSendableSettlement();

        service.createAndSend(command(30_000, "9월 5일"));

        ArgumentCaptor<List<StackShareMessage>> captor = ArgumentCaptor.forClass(List.class);
        verify(notificationSender).send(captor.capture());
        assertThat(captor.getValue().get(0).variables())
                .containsEntry("#{입금계좌}", "토스뱅크 1000-1234-5678 (김승찬)")
                .containsEntry("#{입금기한}", "9월 5일")
                .containsEntry("#{연락처}", "010-1234-5678");
    }

    @Test
    void 입금기한을_비우면_협의로_안내한다() {
        stubSendableSettlement();

        service.createAndSend(command(30_000, "  "));

        ArgumentCaptor<List<StackShareMessage>> captor = ArgumentCaptor.forClass(List.class);
        verify(notificationSender).send(captor.capture());
        assertThat(captor.getValue().get(0).variables()).containsEntry("#{입금기한}", "협의");
    }

    @Test
    void 입금계좌가_등록되지_않았으면_발송하지_않는다() {
        when(templateUseCase.getTemplate("STACK_SHARE_SETTLEMENT")).thenReturn(approvedTemplate());
        when(accountRepository.find()).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createAndSend(command(30_000)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("입금 계좌");
        verify(notificationSender, never()).send(any());
    }

    /** 발송이 성공하는 최소 스텁 묶음. 계좌·기한 검증 테스트가 공유한다. */
    private void stubSendableSettlement() {
        when(templateUseCase.getTemplate("STACK_SHARE_SETTLEMENT")).thenReturn(approvedTemplate());
        when(participantRepository.findByPhoneNumber(any())).thenReturn(Optional.empty());
        when(participantRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(settlementRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(notificationSender.send(any())).thenReturn(new StackShareSendResult("group-id", 3, 3));
    }

    @Test
    void 승인되지_않은_템플릿이면_정산을_발송하지_않는다() {
        when(templateUseCase.getTemplate("STACK_SHARE_SETTLEMENT"))
                .thenReturn(
                        AlimtalkTemplate.builder()
                                .status(AlimtalkTemplateStatus.SUBMITTED)
                                .build());

        assertThatThrownBy(() -> service.createAndSend(command(100_000)))
                .isInstanceOf(BusinessException.class);
        verify(notificationSender, never()).send(any());
    }

    private SendStackShareNotificationsCommand command(long totalAmount) {
        return command(totalAmount, "9월 5일");
    }

    private SendStackShareNotificationsCommand command(long totalAmount, String dueDate) {
        return new SendStackShareNotificationsCommand(
                new StackShareSettlementCommand("Claude Team", "2026년 8월", totalAmount, dueDate),
                List.of(
                        new StackShareRecipientCommand("김승찬", "010-1111-1111", "a@example.com"),
                        new StackShareRecipientCommand("김수민", "010-2222-2222", "b@example.com"),
                        new StackShareRecipientCommand("홍길동", "010-3333-3333", "c@example.com")));
    }

    private AlimtalkTemplate approvedTemplate() {
        return AlimtalkTemplate.builder()
                .templateKey("STACK_SHARE_SETTLEMENT")
                .externalTemplateId("approved-template")
                .status(AlimtalkTemplateStatus.APPROVED)
                .build();
    }
}
