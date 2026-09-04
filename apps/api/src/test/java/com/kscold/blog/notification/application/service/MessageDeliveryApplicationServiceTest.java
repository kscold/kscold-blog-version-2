package com.kscold.blog.notification.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.kscold.blog.notification.domain.model.MessageDeliveryLog;
import com.kscold.blog.notification.domain.port.out.MessageDeliveryLogRepository;
import com.kscold.blog.notification.domain.port.out.MessageDeliveryStatusPort;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessResourceFailureException;

class MessageDeliveryApplicationServiceTest {

    @Test
    void doesNotLogRecipientOrPersistenceErrorMessage() {
        String recipient = "private-recipient@example.com";
        String sensitiveMessage = "mongodb://private-user:private-password@internal-host";
        MessageDeliveryLogRepository repository =
                org.mockito.Mockito.mock(MessageDeliveryLogRepository.class);
        MessageDeliveryStatusPort statusPort =
                org.mockito.Mockito.mock(MessageDeliveryStatusPort.class);
        MessageDeliveryLog deliveryLog =
                MessageDeliveryLog.sent(
                        MessageDeliveryLog.Channel.EMAIL, "TEST", recipient, "비공개 사용자", "비공개 제목");
        when(repository.save(deliveryLog))
                .thenThrow(new DataAccessResourceFailureException(sensitiveMessage));

        Logger logger = (Logger) LoggerFactory.getLogger(MessageDeliveryApplicationService.class);
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
        try {
            new MessageDeliveryApplicationService(repository, statusPort).record(deliveryLog);
        } finally {
            logger.detachAppender(appender);
            appender.stop();
        }

        assertThat(appender.list)
                .singleElement()
                .satisfies(
                        event ->
                                assertThat(event.getFormattedMessage())
                                        .contains("type=DataAccessResourceFailureException")
                                        .doesNotContain(recipient, sensitiveMessage));
    }
}
