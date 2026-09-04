package com.kscold.blog.shared.web;

import static org.assertj.core.api.Assertions.assertThat;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

class HttpAccessLogFilterTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doesNotLogQueryCredentialsOrClientIdentity() throws Exception {
        HttpAccessLogFilter filter = new HttpAccessLogFilter();
        MockHttpServletRequest request =
                new MockHttpServletRequest("GET", "/auth/password-reset/validate");
        request.setQueryString("token=secret-token");
        request.addHeader("X-Forwarded-For", "203.0.113.10");
        MockHttpServletResponse response = new MockHttpServletResponse();
        SecurityContextHolder.getContext()
                .setAuthentication(
                        UsernamePasswordAuthenticationToken.authenticated(
                                "private-user-id", null, List.of()));

        Logger logger = (Logger) LoggerFactory.getLogger(HttpAccessLogFilter.class);
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
        try {
            filter.doFilter(request, response, (req, res) -> {});
        } finally {
            logger.detachAppender(appender);
            appender.stop();
        }

        String message = appender.list.getFirst().getFormattedMessage();
        assertThat(message)
                .contains("GET /auth/password-reset/validate authenticated=true")
                .doesNotContain("secret-token", "private-user-id", "203.0.113.10", "token=");
    }
}
