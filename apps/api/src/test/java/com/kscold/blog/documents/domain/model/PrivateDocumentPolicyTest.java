package com.kscold.blog.documents.domain.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.kscold.blog.exception.InvalidRequestException;
import java.io.ByteArrayInputStream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class PrivateDocumentPolicyTest {

    @Test
    void stripsDirectoriesAndControlCharactersFromFileName() {
        assertThat(PrivateDocumentPolicy.sanitizeFileName("C:\\이력서\\경력\r\n정리.pdf"))
                .isEqualTo("경력정리.pdf");
    }

    @ParameterizedTest
    @ValueSource(strings = {"../", "..", "", ".", "run.sh", "script.js", "evil.exe", "README"})
    void rejectsInvalidAndExecutableFiles(String fileName) {
        assertThatThrownBy(() -> PrivateDocumentPolicy.sanitizeFileName(fileName))
                .isInstanceOf(InvalidRequestException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {"이력서.pdf", "소스.md", "경력.HTML", "이력서.hwp", "이력서.hwpx", "원석.zip"})
    void permitsResumeAndCareerFileFormats(String fileName) {
        assertThat(PrivateDocumentPolicy.sanitizeFileName(fileName)).isEqualTo(fileName);
    }

    @ParameterizedTest
    @ValueSource(longs = {0, -1, 10485761})
    void rejectsEmptyOrOversizedFiles(long size) {
        PrivateDocumentFile file =
                new PrivateDocumentFile(
                        "이력서.pdf", "application/pdf", size, new ByteArrayInputStream(new byte[1]));
        assertThatThrownBy(() -> PrivateDocumentPolicy.validateFile(file))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Test
    void capsFallbackTitleWithoutRejectingValidLongFileName() {
        PrivateDocumentMetadata metadata =
                PrivateDocumentPolicy.normalizeMetadata(
                        new PrivateDocumentMetadata(null, PrivateDocumentCategory.RESUME, null),
                        "가".repeat(170) + ".pdf");
        assertThat(metadata.title()).hasSize(160);
    }

    @Test
    void rejectsOversizedDescription() {
        assertThatThrownBy(
                        () ->
                                PrivateDocumentPolicy.normalizeMetadata(
                                        new PrivateDocumentMetadata(
                                                "이력서",
                                                PrivateDocumentCategory.RESUME,
                                                "가".repeat(2001)),
                                        "이력서.pdf"))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Test
    void substitutesUnsafeContentType() {
        assertThat(PrivateDocumentPolicy.normalizeContentType("text/html\r\nX-Test: true"))
                .isEqualTo("application/octet-stream");
    }
}
