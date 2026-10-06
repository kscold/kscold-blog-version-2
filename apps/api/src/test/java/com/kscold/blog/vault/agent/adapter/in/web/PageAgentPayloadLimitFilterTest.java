package com.kscold.blog.vault.agent.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.support.TestJson;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class PageAgentPayloadLimitFilterTest {

    @Test
    void rejectsOversizedChunkedBodyBeforeParsingAndDoesNotEchoItsContent() throws Exception {
        var request =
                new MockHttpServletRequest("POST", "/vault/agent/page/chat/stream") {
                    @Override
                    public long getContentLengthLong() {
                        return -1;
                    }
                };
        request.setContent(("mock-private-payload".repeat(6000)).getBytes(StandardCharsets.UTF_8));
        var response = new MockHttpServletResponse();
        var filter = new PageAgentPayloadLimitFilter(TestJson.mapper());
        AtomicBoolean invoked = new AtomicBoolean();
        filter.doFilter(request, response, (ignoredRequest, ignoredResponse) -> invoked.set(true));
        assertThat(response.getStatus()).isEqualTo(413);
        assertThat(response.getContentAsString()).doesNotContain("mock-private-payload");
        assertThat(response.getHeader("Cache-Control")).isEqualTo("no-store");
        assertThat(invoked).isFalse();
    }

    @Test
    void unrelatedVaultEndpointRetainsOriginalBodyAndBehavior() throws Exception {
        var request = new MockHttpServletRequest("POST", "/vault/agent/chat/stream");
        request.setContent("일반 질문".getBytes(StandardCharsets.UTF_8));
        var response = new MockHttpServletResponse();
        var filter = new PageAgentPayloadLimitFilter(TestJson.mapper());
        AtomicBoolean invoked = new AtomicBoolean();
        filter.doFilter(
                request,
                response,
                (forwarded, ignoredResponse) -> {
                    assertThat(forwarded.getInputStream().readAllBytes())
                            .isEqualTo("일반 질문".getBytes(StandardCharsets.UTF_8));
                    invoked.set(true);
                });
        assertThat(invoked).isTrue();
    }
}
