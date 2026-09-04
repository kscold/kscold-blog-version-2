package com.kscold.blog.identity.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kscold.blog.config.CorsOriginPolicy;
import jakarta.servlet.http.Cookie;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class CookieCsrfProtectionFilterTest {

    private CookieCsrfProtectionFilter filter;

    @BeforeEach
    void setUp() {
        filter =
                new CookieCsrfProtectionFilter(
                        new CorsOriginPolicy("https://kscold.com"),
                        new ObjectMapper().findAndRegisterModules());
    }

    @Test
    void rejectsUntrustedOriginForCookieAuthenticatedMutation() throws Exception {
        MockHttpServletRequest request = authenticatedPost();
        request.addHeader("Origin", "https://untrusted.example");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean continued = new AtomicBoolean();

        filter.doFilter(
                request, response, (ignoredRequest, ignoredResponse) -> continued.set(true));

        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentAsString()).contains("E201").doesNotContain("untrusted");
        assertThat(continued).isFalse();
    }

    @Test
    void acceptsConfiguredOriginForCookieAuthenticatedMutation() throws Exception {
        MockHttpServletRequest request = authenticatedPost();
        request.addHeader("Origin", "https://kscold.com");

        assertThat(filterContinues(request)).isTrue();
    }

    @Test
    void rejectsCrossSiteFetchMetadataWhenOriginIsMissing() throws Exception {
        MockHttpServletRequest request = authenticatedPost();
        request.addHeader("Sec-Fetch-Site", "cross-site");

        assertThat(filterContinues(request)).isFalse();
    }

    @Test
    void preservesBearerAndSafeMethodApiClients() throws Exception {
        MockHttpServletRequest bearerRequest = authenticatedPost();
        bearerRequest.addHeader("Authorization", "Bearer api-token");
        bearerRequest.addHeader("Origin", "https://untrusted.example");

        MockHttpServletRequest getRequest = new MockHttpServletRequest("GET", "/posts");
        getRequest.setCookies(new Cookie("auth-token", "cookie-token"));
        getRequest.addHeader("Origin", "https://untrusted.example");

        assertThat(filterContinues(bearerRequest)).isTrue();
        assertThat(filterContinues(getRequest)).isTrue();
    }

    private MockHttpServletRequest authenticatedPost() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/users/me");
        request.setCookies(new Cookie("auth-token", "cookie-token"));
        return request;
    }

    private boolean filterContinues(MockHttpServletRequest request) throws Exception {
        AtomicBoolean continued = new AtomicBoolean();
        filter.doFilter(
                request,
                new MockHttpServletResponse(),
                (ignoredRequest, ignoredResponse) -> continued.set(true));
        return continued.get();
    }
}
