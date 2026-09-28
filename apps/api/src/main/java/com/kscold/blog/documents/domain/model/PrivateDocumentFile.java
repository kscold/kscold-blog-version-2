package com.kscold.blog.documents.domain.model;

import java.io.InputStream;

public record PrivateDocumentFile(
        String fileName, String contentType, long size, InputStream inputStream) {}
