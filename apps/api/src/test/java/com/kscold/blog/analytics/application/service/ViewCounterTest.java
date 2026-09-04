package com.kscold.blog.analytics.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.analytics.domain.model.ViewLog;
import com.kscold.blog.analytics.domain.port.out.ViewLogRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class ViewCounterTest {

    @Test
    void 요청_경계에서_변환된_식별자를_그대로_저장한다() {
        ViewLogRepository repository = mock(ViewLogRepository.class);
        when(repository.insertViewLogIfUnique(org.mockito.ArgumentMatchers.any())).thenReturn(true);
        ViewCounter counter = new ViewCounter(repository);
        String clientIdentifier = "a".repeat(64);

        boolean incremented =
                counter.incrementIfUnique("feeds", "feed-id", "FEED", clientIdentifier);

        ArgumentCaptor<ViewLog> captor = ArgumentCaptor.forClass(ViewLog.class);
        verify(repository).insertViewLogIfUnique(captor.capture());
        assertThat(incremented).isTrue();
        assertThat(captor.getValue().getIpHash()).isEqualTo(clientIdentifier);
        verify(repository).incrementViews("feeds", "feed-id");
    }
}
