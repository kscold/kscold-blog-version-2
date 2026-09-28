package com.kscold.blog.documents.domain.model;

import com.kscold.blog.exception.InvalidRequestException;
import java.util.Locale;
import java.util.Set;

public final class PrivateDocumentPolicy {

    public static final long MAX_FILE_SIZE = 10L * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of(
                    "pdf", "md", "txt", "html", "htm", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
                    "csv", "json", "zip", "7z", "png", "jpg", "jpeg", "webp", "gif", "svg", "hwp",
                    "hwpx");

    private PrivateDocumentPolicy() {}

    public static String sanitizeFileName(String originalFileName) {
        if (originalFileName == null) {
            throw InvalidRequestException.invalidInput("파일 이름이 필요합니다.");
        }
        String normalized = originalFileName.replace('\\', '/');
        String fileName =
                normalized
                        .substring(normalized.lastIndexOf('/') + 1)
                        .replaceAll("[\\p{Cntrl}\\p{Cf}]", "")
                        .strip();
        if (fileName.isBlank()
                || fileName.equals(".")
                || fileName.equals("..")
                || fileName.length() > 255) {
            throw InvalidRequestException.invalidInput("파일 이름은 1~255자로 입력해주세요.");
        }
        int extensionStart = fileName.lastIndexOf('.');
        if (extensionStart < 1
                || !ALLOWED_EXTENSIONS.contains(
                        fileName.substring(extensionStart + 1).toLowerCase(Locale.ROOT))) {
            throw InvalidRequestException.invalidInput("문서·이미지·압축 파일만 업로드할 수 있습니다.");
        }
        return fileName;
    }

    public static void validateFile(PrivateDocumentFile file) {
        if (file == null
                || file.inputStream() == null
                || file.size() <= 0
                || file.size() > MAX_FILE_SIZE) {
            throw InvalidRequestException.invalidInput("빈 파일은 올릴 수 없고, 파일당 최대 10MB입니다.");
        }
    }

    public static PrivateDocumentMetadata normalizeMetadata(
            PrivateDocumentMetadata metadata, String fallbackTitle) {
        if (metadata == null || metadata.category() == null) {
            throw InvalidRequestException.invalidInput("문서 분류를 선택해주세요.");
        }
        String title = metadata.title() == null ? "" : metadata.title().strip();
        if (title.isBlank()) {
            title =
                    fallbackTitle == null
                            ? null
                            : fallbackTitle.substring(0, Math.min(fallbackTitle.length(), 160));
        }
        if (title == null
                || title.isBlank()
                || title.length() > 160
                || hasControlCharacters(title)) {
            throw InvalidRequestException.invalidInput("제목은 1~160자로 입력해주세요.");
        }
        String description = metadata.description() == null ? "" : metadata.description().strip();
        if (description.length() > 2000 || description.indexOf('\0') >= 0) {
            throw InvalidRequestException.invalidInput("설명은 2,000자 이내로 입력해주세요.");
        }
        return new PrivateDocumentMetadata(title, metadata.category(), description);
    }

    public static String normalizeContentType(String contentType) {
        if (contentType == null) {
            return "application/octet-stream";
        }
        String normalized = contentType.split(";", 2)[0].strip();
        return normalized.length() <= 128
                        && normalized.matches("[A-Za-z0-9!#$&^_.+\\-]+/[A-Za-z0-9!#$&^_.+\\-]+")
                ? normalized
                : "application/octet-stream";
    }

    private static boolean hasControlCharacters(String value) {
        return value.codePoints().anyMatch(Character::isISOControl);
    }
}
