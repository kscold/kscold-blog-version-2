package com.kscold.blog.documents.application.dto;

import com.kscold.blog.documents.domain.model.PrivateDocumentFile;
import com.kscold.blog.documents.domain.model.PrivateDocumentMetadata;

public record UploadPrivateDocumentCommand(
        String ownerId, PrivateDocumentFile file, PrivateDocumentMetadata metadata) {}
