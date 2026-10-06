package com.kscold.blog.shared.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import jakarta.servlet.RequestDispatcher;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class FallbackErrorControllerTest {

    private final FallbackErrorController controller = new FallbackErrorController();

    @Test
    void answersWithTheStatusTheContainerDecided() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/error");
        request.setAttribute(RequestDispatcher.ERROR_STATUS_CODE, 405);

        ResponseEntity<ApiResponse<Void>> response =
                controller.handle(request, new MockHttpServletResponse());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.METHOD_NOT_ALLOWED);
        assertThat(response.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_JSON);
        assertThat(response.getBody().getErrorCode()).isEqualTo("E004");
    }

    @Test
    void rethrowsTheFailureSoTheSharedExceptionHandlerDealsWithIt() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/error");
        IllegalStateException failure = new IllegalStateException("필터에서 난 예외");
        request.setAttribute(RequestDispatcher.ERROR_STATUS_CODE, 500);
        request.setAttribute(RequestDispatcher.ERROR_EXCEPTION, failure);

        assertThatThrownBy(() -> controller.handle(request, new MockHttpServletResponse()))
                .isSameAs(failure);
    }

    @Test
    void addsNothingToAResponseThatHasAlreadyBeenSent() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/error");
        request.setAttribute(RequestDispatcher.ERROR_STATUS_CODE, 500);
        request.setAttribute(RequestDispatcher.ERROR_EXCEPTION, new IllegalStateException());
        MockHttpServletResponse response = new MockHttpServletResponse();
        response.setCommitted(true);

        assertThat(controller.handle(request, response)).isNull();
    }

    @Test
    void directCallWithoutAnErrorIsNotFound() throws Exception {
        ResponseEntity<ApiResponse<Void>> response =
                controller.handle(
                        new MockHttpServletRequest("GET", "/error"), new MockHttpServletResponse());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody().getErrorCode()).isEqualTo("E301");
    }

    @Test
    void statusThatIsNotAnErrorIsTreatedAsAServerError() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/error");
        request.setAttribute(RequestDispatcher.ERROR_STATUS_CODE, 200);

        ResponseEntity<ApiResponse<Void>> response =
                controller.handle(request, new MockHttpServletResponse());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().getErrorCode()).isEqualTo("E901");
    }
}
