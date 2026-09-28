package com.kscold.blog.documents.domain.model;

public record PrivateDocumentMetadata(
        String title, PrivateDocumentCategory category, String description) {}
