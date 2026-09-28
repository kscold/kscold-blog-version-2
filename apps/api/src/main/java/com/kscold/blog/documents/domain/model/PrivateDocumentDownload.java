package com.kscold.blog.documents.domain.model;

import java.io.InputStream;

public record PrivateDocumentDownload(String fileName, long size, InputStream inputStream) {}
