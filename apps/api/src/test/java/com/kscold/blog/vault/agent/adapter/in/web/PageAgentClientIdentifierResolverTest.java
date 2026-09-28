package com.kscold.blog.vault.agent.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.kscold.blog.vault.agent.config.VaultAgentProperties;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class PageAgentClientIdentifierResolverTest {

    @Test
    void userAgentAndForgedForwardedHeadersCannotCreateNewCostKeys() {
        var resolver = resolver("");
        var first = request("192.0.2.1", "192.0.2.10", "one-browser");
        var second = request("192.0.2.1", "192.0.2.11", "different-browser");
        assertThat(resolver.resolve(first)).isEqualTo(resolver.resolve(second));
        assertThat(resolver.resolve(first)).doesNotContain("192.0.2", "one-browser");
        assertThat(resolver.resolve(request("192.0.2.2", null, null)))
                .isNotEqualTo(resolver.resolve(first));
    }

    @Test
    void trustsOnlyExactConfiguredProxyAndWalksForwardedChainFromRight() {
        var resolver = resolver("10.0.0.1,10.0.0.2");
        var request = request("10.0.0.1", "192.0.2.99, 192.0.2.1, 10.0.0.2", "browser");
        assertThat(resolver.resolve(request))
                .isEqualTo(resolver.resolve(request("192.0.2.1", null, null)));
        assertThat(resolver.resolve(request("10.0.0.1", "192.0.2.88, 192.0.2.1, 10.0.0.2", null)))
                .isEqualTo(resolver.resolve(request));
        assertThat(resolver.resolve(request("10.0.0.9", "192.0.2.1", null)))
                .isEqualTo(resolver.resolve(request("10.0.0.9", null, null)));
    }

    @Test
    void malformedOrRepeatedForwardedHeadersFallBackToConnectedProxyKey() {
        var resolver = resolver("10.0.0.1");
        String expected = resolver.resolve(request("10.0.0.1", null, null));
        for (String forwarded :
                new String[] {"named-host.test", "192.0.2.1,", "999.0.2.1", "a".repeat(1025)}) {
            assertThat(resolver.resolve(request("10.0.0.1", forwarded, null))).isEqualTo(expected);
        }
        var repeated = request("10.0.0.1", "192.0.2.1", null);
        repeated.addHeader("X-Forwarded-For", "192.0.2.2");
        assertThat(resolver.resolve(repeated)).isEqualTo(expected);
    }

    @Test
    void canonicalizesIpv6WithoutDnsNamesOrZoneIdentifiers() {
        var resolver = resolver("2001:db8::1");
        assertThat(resolver.resolve(request("2001:db8:0:0:0:0:0:1", "2001:db8::2", null)))
                .isEqualTo(resolver.resolve(request("2001:db8:0:0:0:0:0:2", null, null)));
        assertThatThrownBy(() -> resolver("proxy.example.test"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageNotContaining("proxy.example.test");
        assertThatThrownBy(() -> resolver("fe80::1%en0"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    private PageAgentClientIdentifierResolver resolver(String proxies) {
        var properties = new VaultAgentProperties();
        properties.setPageChatTrustedProxyAddresses(proxies);
        return new PageAgentClientIdentifierResolver(properties);
    }

    private MockHttpServletRequest request(String remote, String forwarded, String userAgent) {
        var request = new MockHttpServletRequest();
        request.setRemoteAddr(remote);
        if (forwarded != null) {
            request.addHeader("X-Forwarded-For", forwarded);
        }
        if (userAgent != null) {
            request.addHeader("User-Agent", userAgent);
        }
        return request;
    }
}
