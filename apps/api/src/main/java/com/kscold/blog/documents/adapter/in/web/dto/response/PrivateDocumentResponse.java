package com.kscold.blog.documents.adapter.in.web.dto.response;

import com.kscold.blog.documents.domain.model.PrivateDocument;
import com.kscold.blog.documents.domain.model.PrivateDocumentCategory;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrivateDocumentResponse {

    private String id;
    private String title;
    private String fileName;
    private PrivateDocumentCategory category;
    private String description;
    private long size;
    private String contentType;
    private Instant createdAt;
    private Instant updatedAt;

    public static PrivateDocumentResponse from(PrivateDocument document) {
        return PrivateDocumentResponse.builder()
                .id(document.getId())
                .title(document.getTitle())
                .fileName(document.getFileName())
                .category(document.getCategory())
                .description(document.getDescription())
                .size(document.getSize())
                .contentType(document.getContentType())
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }
}
