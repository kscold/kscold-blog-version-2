package com.kscold.blog.stackshare.adapter.out.external;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.stackshare.config.SolapiProperties;
import com.kscold.blog.stackshare.domain.model.StackShareMessage;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class SolapiStackShareNotificationAdapterTest {

    @Test
    void 외부_API_오류_응답_본문을_로그에_남기지_않는다() {
        String sensitiveResponse = "upstream-secret-response-body";
        SolapiProperties properties = configuredProperties();
        SolapiAuthenticationHeaderFactory headerFactory =
                mock(SolapiAuthenticationHeaderFactory.class);
        when(headerFactory.create("test-key", "test-secret")).thenReturn("test-authorization");

        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo("https://solapi.invalid/messages/v4/send-many/detail"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(
                        withServerError()
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(sensitiveResponse));

        SolapiStackShareNotificationAdapter adapter =
                new SolapiStackShareNotificationAdapter(properties, headerFactory, builder);
        Logger logger = (Logger) LoggerFactory.getLogger(SolapiStackShareNotificationAdapter.class);
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
        try {
            assertThatThrownBy(
                            () ->
                                    adapter.send(
                                            List.of(
                                                    new StackShareMessage(
                                                            "01000000000",
                                                            "test-template",
                                                            Map.of("#{name}", "test")))))
                    .isInstanceOf(BusinessException.class);
        } finally {
            logger.detachAppender(appender);
            appender.stop();
        }

        server.verify();
        assertThat(appender.list)
                .extracting(ILoggingEvent::getFormattedMessage)
                .anyMatch(message -> message.contains("status=500"))
                .noneMatch(message -> message.contains(sensitiveResponse));
    }

    private SolapiProperties configuredProperties() {
        SolapiProperties properties = new SolapiProperties();
        properties.setEnabled(true);
        properties.setApiKey("test-key");
        properties.setApiSecret("test-secret");
        properties.setSenderPhone("01000000000");
        properties.setKakaoPfId("test-profile");
        properties.setApiBaseUrl("https://solapi.invalid");
        return properties;
    }
}
