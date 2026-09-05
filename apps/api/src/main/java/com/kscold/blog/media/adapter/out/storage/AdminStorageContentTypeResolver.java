package com.kscold.blog.media.adapter.out.storage;

import java.util.Locale;

final class AdminStorageContentTypeResolver {

    private AdminStorageContentTypeResolver() {}

    static String resolve(String contentType, String fileName) {
        if (contentType != null && !contentType.isBlank()) {
            return contentType;
        }
        return infer(fileName);
    }

    static boolean isImage(String name) {
        String lowerCase = name.toLowerCase(Locale.ROOT);
        return lowerCase.endsWith(".png")
                || lowerCase.endsWith(".jpg")
                || lowerCase.endsWith(".jpeg")
                || lowerCase.endsWith(".gif")
                || lowerCase.endsWith(".webp")
                || lowerCase.endsWith(".svg");
    }

    static String infer(String name) {
        String lowerCase = name.toLowerCase(Locale.ROOT);
        if (lowerCase.endsWith(".png")) return "image/png";
        if (lowerCase.endsWith(".jpg") || lowerCase.endsWith(".jpeg")) return "image/jpeg";
        if (lowerCase.endsWith(".gif")) return "image/gif";
        if (lowerCase.endsWith(".webp")) return "image/webp";
        if (lowerCase.endsWith(".svg")) return "image/svg+xml";
        if (lowerCase.endsWith(".json")) return "application/json; charset=utf-8";
        if (lowerCase.endsWith(".txt")) return "text/plain; charset=utf-8";
        if (lowerCase.endsWith(".md")) return "text/markdown; charset=utf-8";
        if (lowerCase.endsWith(".html")) return "text/html; charset=utf-8";
        if (lowerCase.endsWith(".css")) return "text/css; charset=utf-8";
        if (lowerCase.endsWith(".js")) return "application/javascript; charset=utf-8";
        return "application/octet-stream";
    }
}
