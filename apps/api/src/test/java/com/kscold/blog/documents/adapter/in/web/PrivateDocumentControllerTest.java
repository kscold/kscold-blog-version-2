package com.kscold.blog.documents.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.kscold.blog.documents.application.port.in.PrivateDocumentUseCase;
import com.kscold.blog.documents.domain.model.PrivateDocumentDownload;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@ExtendWith(MockitoExtension.class)
class PrivateDocumentControllerTest {

    @Mock private PrivateDocumentUseCase useCase;

    @Test
    void streamsEvenHtmlAsProtectedAttachmentAndClosesResource() throws Exception {
        CloseTrackingInputStream source = new CloseTrackingInputStream(new byte[] {1, 2, 3});
        when(useCase.download("owner", "document-id"))
                .thenReturn(new PrivateDocumentDownload("경력 정리.html", 3, source));
        PrivateDocumentController controller = new PrivateDocumentController(useCase);
        var response = controller.download("owner", "document-id");
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        response.getBody().writeTo(output);
        assertThat(output.toByteArray()).containsExactly(1, 2, 3);
        assertThat(source.closed).isTrue();
        assertThat(response.getHeaders().getContentType())
                .isEqualTo(MediaType.APPLICATION_OCTET_STREAM);
        assertThat(response.getHeaders().getContentLength()).isEqualTo(3);
        assertThat(response.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION))
                .startsWith("attachment;")
                .contains("filename*=");
        assertThat(response.getHeaders().getCacheControl()).isEqualTo("no-store");
        assertThat(response.getHeaders().getFirst("X-Content-Type-Options")).isEqualTo("nosniff");
        assertThat(response.getHeaders().getFirst("Content-Security-Policy"))
                .contains("sandbox", "default-src 'none'");
        assertThat(response.getHeaders().getFirst("X-Robots-Tag")).contains("noindex");
    }

    private static final class CloseTrackingInputStream extends ByteArrayInputStream {

        private boolean closed;

        private CloseTrackingInputStream(byte[] bytes) {
            super(bytes);
        }

        @Override
        public void close() throws IOException {
            closed = true;
            super.close();
        }
    }
}
