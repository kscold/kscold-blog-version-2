package com.kscold.blog.analytics.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.kscold.blog.analytics.domain.model.PageVisitLog;
import com.kscold.blog.analytics.domain.port.out.PageVisitLogRepository;
import com.kscold.blog.shared.security.OneWayIdentifierHasher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class PageVisitServiceTest {

    private PageVisitLogRepository repository;
    private PageVisitService service;

    @BeforeEach
    void setUp() {
        repository = mock(PageVisitLogRepository.class);
        service = new PageVisitService(repository);
    }

    @Test
    void recordsNewPublicRouteFamilies() {
        String clientIdentifier = OneWayIdentifierHasher.hash("203.0.113.10|browser");
        service.record("/product", clientIdentifier, null, null);
        service.record("/profile/kscold", clientIdentifier, "user-1", "김승찬");
        service.record("/tags/AI%20Agent", null, null, null);

        ArgumentCaptor<PageVisitLog> logs = ArgumentCaptor.forClass(PageVisitLog.class);
        verify(repository, org.mockito.Mockito.times(3)).insert(logs.capture());
        assertThat(logs.getAllValues())
                .extracting(PageVisitLog::getPath)
                .containsExactly("/product", "/profile/kscold", "/tags/AI%20Agent");
        assertThat(logs.getAllValues().getFirst().getIpHash()).isEqualTo(clientIdentifier);
        assertThat(logs.getAllValues().get(2).getIpHash()).isEqualTo("anon");
    }

    @Test
    void rejectsUnknownOrDeeplyNestedRoutes() {
        service.record("/login/not-found", "203.0.113.10", null, null);
        service.record("/info/not-found", "203.0.113.10", null, null);
        service.record("/blog/java/post/extra", "203.0.113.10", null, null);

        verify(repository, never()).insert(org.mockito.ArgumentMatchers.any());
    }
}
