package com.kscold.blog.exception;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import com.kscold.blog.notification.application.port.in.NotificationUseCase;
import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.vault.agent.application.dto.command.ChatCommand;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

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
}
