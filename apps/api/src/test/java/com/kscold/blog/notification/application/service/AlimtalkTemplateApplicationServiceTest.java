package com.kscold.blog.notification.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.notification.domain.model.AlimtalkTemplate;
import com.kscold.blog.notification.domain.model.AlimtalkTemplateStatus;
import com.kscold.blog.notification.domain.model.AlimtalkTemplateType;
import com.kscold.blog.notification.domain.port.out.AlimtalkTemplateRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class AlimtalkTemplateApplicationServiceTest {

    private static final String SETTLEMENT_KEY = "STACK_SHARE_SETTLEMENT";

    private AlimtalkTemplateRepository repository;
    private AlimtalkTemplateApplicationService service;

    @BeforeEach
    void setUp() {
        repository = mock(AlimtalkTemplateRepository.class);
        service = new AlimtalkTemplateApplicationService(repository);
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    @DisplayName("시나리오: 아직 제출 전(DRAFT)인 템플릿은 최신 기본 문구로 갱신된다")
    void refreshesDraftTemplateBody() {
        AlimtalkTemplate stale =
                AlimtalkTemplate.builder()
                        .templateKey(SETTLEMENT_KEY)
                        .body("옛 문구")
                        .variables(List.of("#{이름}"))
                        .status(AlimtalkTemplateStatus.DRAFT)
                        .build();
        when(repository.findByTemplateKey(any())).thenReturn(Optional.empty());
        when(repository.findByTemplateKey(SETTLEMENT_KEY)).thenReturn(Optional.of(stale));

        service.seedDefaults();

        ArgumentCaptor<AlimtalkTemplate> captor = ArgumentCaptor.forClass(AlimtalkTemplate.class);
        verify(repository, org.mockito.Mockito.atLeastOnce()).save(captor.capture());
        AlimtalkTemplate saved =
                captor.getAllValues().stream()
                        .filter(t -> SETTLEMENT_KEY.equals(t.getTemplateKey()))
                        .findFirst()
                        .orElseThrow();
        assertThat(saved.getBody()).contains("입금 계좌", "입금 기한");
        assertThat(saved.getVariables()).contains("#{입금계좌}", "#{입금기한}");
        assertThat(saved.getTemplateType()).isEqualTo(AlimtalkTemplateType.EMPHASIS);
        assertThat(saved.getEmphasisTitle()).isEqualTo("[KSCOLD] 공동 구독 정산 안내");
    }

    @Test
    @DisplayName("시나리오: 승인된 템플릿은 카카오 등록 본문과 어긋나면 안 되므로 덮어쓰지 않는다")
    void keepsApprovedTemplateBody() {
        AlimtalkTemplate approved =
                AlimtalkTemplate.builder()
                        .templateKey(SETTLEMENT_KEY)
                        .body("카카오에 승인된 본문")
                        .variables(List.of("#{이름}"))
                        .externalTemplateId("approved-id")
                        .templateType(null)
                        .status(AlimtalkTemplateStatus.APPROVED)
                        .build();
        // 승인 템플릿만 존재하고 나머지 기본 템플릿은 없는 상태로 둔다.
        when(repository.findByTemplateKey(any())).thenReturn(Optional.empty());
        when(repository.findByTemplateKey(SETTLEMENT_KEY)).thenReturn(Optional.of(approved));

        service.seedDefaults();

        assertThat(approved.getBody()).isEqualTo("카카오에 승인된 본문");
        assertThat(approved.getTemplateType()).isEqualTo(AlimtalkTemplateType.EMPHASIS);
        assertThat(approved.getEmphasisSubtitle()).isEqualTo("확정된 공동 구독 정산 내역입니다.");
        verify(repository).save(approved);
    }
}
