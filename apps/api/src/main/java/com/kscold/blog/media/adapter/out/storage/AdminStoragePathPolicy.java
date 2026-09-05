package com.kscold.blog.media.adapter.out.storage;

import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
import java.util.ArrayList;
import java.util.List;

final class AdminStoragePathPolicy {

    private AdminStoragePathPolicy() {}

    static String normalizePrefix(String value) {
        String normalized = normalizePath(value);
        return normalized.isBlank() ? "" : normalized + "/";
    }

    static String normalizeObjectKey(String value) {
        String normalized = normalizePath(value);
        if (normalized.isBlank()) {
            throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "파일 경로를 확인해주세요.");
        }
        return normalized;
    }

    static String extractFileName(String originalFilename) {
        String normalized =
                trimSlashes(
                        (originalFilename == null ? "" : originalFilename.trim())
                                .replace("\\", "/"));
        int lastSlashIndex = normalized.lastIndexOf('/');
        String fileName =
                lastSlashIndex >= 0 ? normalized.substring(lastSlashIndex + 1) : normalized;

        if (fileName.isBlank()) {
            throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "파일 이름을 확인해주세요.");
        }
        return fileName;
    }

    static String extractLeafName(String key) {
        int lastSlashIndex = key.lastIndexOf('/');
        return lastSlashIndex >= 0 ? key.substring(lastSlashIndex + 1) : key;
    }

    static String buildParentPrefix(String prefix) {
        if (prefix == null || prefix.isBlank()) {
            return null;
        }

        String normalized = prefix.replaceAll("/$", "");
        int lastSlashIndex = normalized.lastIndexOf('/');
        return lastSlashIndex < 0 ? "" : normalized.substring(0, lastSlashIndex + 1);
    }

    static String trimSlashes(String value) {
        return value.replaceAll("^/+", "").replaceAll("/+$", "");
    }

    private static String normalizePath(String value) {
        String raw = value == null ? "" : value.trim().replace("\\", "/");
        if (raw.isBlank()) {
            return "";
        }

        String[] segments = raw.replaceAll("^/+", "").split("/");
        List<String> normalizedSegments = new ArrayList<>();
        for (String segment : segments) {
            if (segment == null || segment.isBlank() || ".".equals(segment)) {
                continue;
            }
            if ("..".equals(segment)) {
                throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "잘못된 경로입니다.");
            }
            normalizedSegments.add(segment);
        }
        return String.join("/", normalizedSegments);
    }
}
