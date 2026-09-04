package com.kscold.blog.media.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.media.domain.model.Media;
import com.kscold.blog.media.domain.port.out.FileStoragePort;
import com.kscold.blog.media.domain.port.out.MediaRepository;
import java.nio.charset.StandardCharsets;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class MediaApplicationServiceTest {

    @Mock private MediaRepository mediaRepository;
    @Mock private FileStoragePort fileStoragePort;

    private MediaApplicationService service;

    @BeforeEach
    void setUp() {
        service = new MediaApplicationService(mediaRepository, fileStoragePort);
        ReflectionTestUtils.setField(service, "maxFileSize", 10L * 1024 * 1024);
    }

    @ParameterizedTest
    @MethodSource("supportedRasterImages")
    void uploadsRasterImageWhenExtensionMimeAndSignatureMatch(
            String filename, String contentType, byte[] content) {
        MockMultipartFile file = new MockMultipartFile("file", filename, contentType, content);
        when(fileStoragePort.store(file)).thenReturn("https://bucket.example/asset");
        when(mediaRepository.save(any(Media.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Media media = service.upload(file, "user-1", "사용자");

        assertThat(media.getContentType()).isEqualTo(contentType);
        verify(fileStoragePort).store(file);
    }

    @Test
    void rejectsMismatchedExtensionAndMimeTypeBeforeStorage() {
        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "photo.jpg",
                        "image/png",
                        new byte[] {(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a});

        assertThatThrownBy(() -> service.upload(file, "user-1", "사용자"))
                .isInstanceOf(InvalidRequestException.class);
        verify(fileStoragePort, never()).store(any());
    }

    @Test
    void rejectsSpoofedImageContentBeforeStorage() {
        MockMultipartFile file =
                new MockMultipartFile(
                        "file", "photo.png", "image/png", "<html>not an image</html>".getBytes());

        assertThatThrownBy(() -> service.upload(file, "user-1", "사용자"))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("파일 내용");
        verify(fileStoragePort, never()).store(any());
    }

    @Test
    void rejectsScriptableSvgFromGeneralUserUpload() {
        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "image.svg",
                        "image/svg+xml",
                        "<svg><script>alert(1)</script></svg>".getBytes());

        assertThatThrownBy(() -> service.upload(file, "user-1", "사용자"))
                .isInstanceOf(InvalidRequestException.class);
        verify(fileStoragePort, never()).store(any());
    }

    private static Stream<Arguments> supportedRasterImages() {
        return Stream.of(
                Arguments.of(
                        "photo.jpg",
                        "image/jpeg",
                        new byte[] {(byte) 0xff, (byte) 0xd8, (byte) 0xff, 0x00}),
                Arguments.of(
                        "photo.png",
                        "image/png",
                        new byte[] {(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00}),
                Arguments.of(
                        "photo.gif",
                        "image/gif",
                        "GIF89a-content".getBytes(StandardCharsets.US_ASCII)),
                Arguments.of(
                        "photo.webp",
                        "image/webp",
                        new byte[] {
                            0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50
                        }));
    }
}
