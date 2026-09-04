package com.kscold.blog.media.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.kscold.blog.media.application.port.in.AdminStorageUseCase;
import com.kscold.blog.media.domain.model.AdminStorageObjectResource;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@ExtendWith(MockitoExtension.class)
class AdminStorageControllerTest {

    @Mock private AdminStorageUseCase adminStorageUseCase;

    @Test
    @DisplayName("시나리오: 관리자 저장소 객체는 버퍼링 없이 응답 스트림으로 전달하고 원본을 닫는다")
    void getObjectStreamsAndClosesResource() throws Exception {
        CloseTrackingInputStream inputStream = new CloseTrackingInputStream(new byte[] {1, 2, 3});
        when(adminStorageUseCase.getObject("images/hero.png"))
                .thenReturn(
                        AdminStorageObjectResource.builder()
                                .fileName("hero.png")
                                .contentType("image/png")
                                .contentLength(3L)
                                .inputStream(inputStream)
                                .build());
        AdminStorageController controller = new AdminStorageController(adminStorageUseCase);

        ResponseEntity<StreamingResponseBody> response = controller.getObject("images/hero.png", 1);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        response.getBody().writeTo(outputStream);

        assertThat(outputStream.toByteArray()).containsExactly(1, 2, 3);
        assertThat(inputStream.isClosed()).isTrue();
        assertThat(response.getHeaders().getContentLength()).isEqualTo(3L);
        assertThat(response.getHeaders().getContentType().toString()).isEqualTo("image/png");
        assertThat(response.getHeaders().getCacheControl()).isEqualTo("no-store");
        assertThat(response.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION))
                .startsWith("attachment;")
                .contains("hero.png");
    }

    private static final class CloseTrackingInputStream extends ByteArrayInputStream {

        private boolean closed;

        private CloseTrackingInputStream(byte[] buffer) {
            super(buffer);
        }

        @Override
        public void close() throws IOException {
            closed = true;
            super.close();
        }

        private boolean isClosed() {
            return closed;
        }
    }
}
