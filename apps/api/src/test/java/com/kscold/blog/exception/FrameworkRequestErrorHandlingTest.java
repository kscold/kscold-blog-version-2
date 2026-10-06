package com.kscold.blog.exception;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import com.kscold.blog.notification.application.port.in.NotificationUseCase;
import com.kscold.blog.notification.domain.model.NotificationMessage;
import com.kscold.blog.shared.web.ApiResponse;
import jakarta.servlet.RequestDispatcher;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;

/** 따로 처리기를 두지 않은 예외가 "서버 오류"로 뭉개지지 않고, 알림이 실제 장애만 가리키는지 확인한다. */
class FrameworkRequestErrorHandlingTest {

    private final NotificationUseCase notifications = mock(NotificationUseCase.class);
    private final GlobalExceptionHandler handler = new GlobalExceptionHandler(notifications);

    @Test
    void unsupportedRequestBodyFormatIsAClientErrorWithoutAnAlert() {
        ResponseEntity<ApiResponse<Void>> response =
                handler.handleException(
                        new HttpMediaTypeNotSupportedException(
                                MediaType.TEXT_PLAIN, List.of(MediaType.APPLICATION_JSON)),
                        new MockHttpServletRequest("POST", "/api/auth/login"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        assertThat(response.getBody().getErrorCode())
                .isEqualTo(ErrorCode.INVALID_INPUT_VALUE.getCode());
        assertThat(response.getBody().getMessage()).isEqualTo("지원하지 않는 요청 본문 형식입니다.");
        // 어떤 형식으로 다시 보내면 되는지는 그대로 알려 준다.
        assertThat(response.getHeaders().getAccept()).containsExactly(MediaType.APPLICATION_JSON);
        verifyNoInteractions(notifications);
    }

    @Test
    void unsupportedResponseFormatIsAClientErrorWithoutAnAlert() {
        ResponseEntity<ApiResponse<Void>> response =
                handler.handleException(
                        new HttpMediaTypeNotAcceptableException(
                                List.of(MediaType.APPLICATION_JSON)),
                        new MockHttpServletRequest("GET", "/api/health"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_ACCEPTABLE);
        assertThat(response.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_JSON);
        verifyNoInteractions(notifications);
    }

    @Test
    void businessErrorsFixTheirResponseFormatSoStreamingClientsStillReceiveThem() {
        ResponseEntity<ApiResponse<Void>> response =
                handler.handleBusinessException(
                        new RateLimitExceededException("잠시 후 다시 시도해주세요."),
                        new MockHttpServletRequest("POST", "/api/vault/agent/page/chat/stream"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
        assertThat(response.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_JSON);
    }

    @Test
    void alertNamesTheOriginalRequestWhenTheFailureArrivedThroughTheErrorPath() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/error");
        request.setAttribute(RequestDispatcher.ERROR_REQUEST_URI, "/api/admin/storage/object");
        request.setAttribute(RequestDispatcher.ERROR_METHOD, "POST");

        ResponseEntity<ApiResponse<Void>> response =
                handler.handleException(new IllegalStateException("never-send-this"), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        ArgumentCaptor<NotificationMessage> alert =
                ArgumentCaptor.forClass(NotificationMessage.class);
        verify(notifications).notify(alert.capture());
        assertThat(alert.getValue().fields())
                .containsExactly(
                        new NotificationMessage.Field("요청", "POST /api/admin/storage/object"));
    }
}
