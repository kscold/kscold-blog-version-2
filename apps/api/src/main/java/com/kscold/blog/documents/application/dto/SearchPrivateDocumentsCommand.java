package com.kscold.blog.documents.application.dto;

import com.kscold.blog.documents.domain.model.PrivateDocumentSearchCriteria;

public record SearchPrivateDocumentsCommand(
        PrivateDocumentSearchCriteria criteria, int page, int size) {}
