package com.kscold.blog.documents.domain.model;

public record PrivateDocumentSearchCriteria(
        String ownerId, PrivateDocumentCategory category, String query) {}
