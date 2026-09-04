package com.kscold.blog.exception;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.kscold.blog.notification.application.port.in.NotificationUseCase;
import com.kscold.blog.notification.domain.model.NotificationMessage;
import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.vault.agent.application.dto.command.ChatCommand;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;

class GlobalExceptionHandlerTest {

    @Test
    void convertsMethodParameterValidationFailureToBadRequest() {
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
        ChatCommand request = ChatCommand.builder().message("질문").sessionId("a".repeat(81)).build();
        Set<ConstraintViolation<ChatCommand>> violations = validator.validate(request);
        GlobalExceptionHandler handler =
                new GlobalExceptionHandler(mock(NotificationUseCase.class));

        ResponseEntity<ApiResponse<Void>> response =
                handler.handleConstraintViolationException(
                        new ConstraintViolationException(violations));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getErrorCode())
                .isEqualTo(ErrorCode.INVALID_INPUT_VALUE.getCode());
        assertThat(response.getBody().getMessage()).isEqualTo("세션 값이 너무 깁니다.");
    }

    @Test
    void bindFailureLogDoesNotIncludeRejectedSecretValue() {
        Logger logger = (Logger) LoggerFactory.getLogger(GlobalExceptionHandler.class);
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
        BindException exception = new BindException(new Object(), "request");
        exception.addError(
                new FieldError(
                        "request",
                        "password",
                        "never-log-this-secret",
                        false,
                        null,
                        null,
                        "비밀번호 형식이 올바르지 않습니다."));
        GlobalExceptionHandler handler =
                new GlobalExceptionHandler(mock(NotificationUseCase.class));

        try {
            handler.handleBindException(exception);

            assertThat(appender.list)
                    .extracting(ILoggingEvent::getFormattedMessage)
                    .singleElement()
                    .asString()
                    .contains("password")
                    .doesNotContain("never-log-this-secret");
        } finally {
            logger.detachAppender(appender);
            appender.stop();
        }
    }

    @Test
    void unexpectedFailureDoesNotSendExceptionMessageToNotification() {
        NotificationUseCase notificationUseCase = mock(NotificationUseCase.class);
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getMethod()).thenReturn("POST");
        when(request.getRequestURI()).thenReturn("/auth/login");
        GlobalExceptionHandler handler = new GlobalExceptionHandler(notificationUseCase);

        handler.handleException(new IllegalStateException("never-send-this-secret"), request);

        ArgumentCaptor<NotificationMessage> notification =
                ArgumentCaptor.forClass(NotificationMessage.class);
        verify(notificationUseCase).notify(notification.capture());
        assertThat(notification.getValue().description())
                .isEqualTo("IllegalStateException")
                .doesNotContain("never-send-this-secret");
    }
}
