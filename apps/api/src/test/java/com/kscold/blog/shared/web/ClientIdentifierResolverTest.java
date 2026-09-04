package com.kscold.blog.shared.web;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class ClientIdentifierResolverTest {

    private final ClientIdentifierResolver resolver = new ClientIdentifierResolver();

    @Test
    void 원본_IP와_브라우저_정보를_고정_길이_식별자로_변환한다() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "203.0.113.10, 10.0.0.2");
        request.addHeader("User-Agent", "private-browser-signature");

        String first = resolver.resolve(request);
        String second = resolver.resolve(request);

        assertThat(first)
                .hasSize(64)
                .matches("[0-9a-f]{64}")
                .isEqualTo(second)
                .doesNotContain("203.0.113.10", "private-browser-signature", "|");
    }

    @Test
    void 같은_IP에서도_브라우저가_다르면_다른_식별자를_만든다() {
        MockHttpServletRequest first = new MockHttpServletRequest();
        first.setRemoteAddr("203.0.113.10");
        first.addHeader("User-Agent", "browser-a");
        MockHttpServletRequest second = new MockHttpServletRequest();
        second.setRemoteAddr("203.0.113.10");
        second.addHeader("User-Agent", "browser-b");

        assertThat(resolver.resolve(first)).isNotEqualTo(resolver.resolve(second));
    }
}
