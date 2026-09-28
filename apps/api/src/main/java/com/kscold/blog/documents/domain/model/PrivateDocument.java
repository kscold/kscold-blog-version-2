package com.kscold.blog.documents.domain.model;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "private_documents")
@CompoundIndex(name = "owner_created_id", def = "{'ownerId': 1, 'createdAt': -1, '_id': -1}")
@CompoundIndex(
        name = "owner_category_created_id",
        def = "{'ownerId': 1, 'category': 1, 'createdAt': -1, '_id': -1}")
public class PrivateDocument {

    @Id private String id;
    private String ownerId;
    private String objectKey;
    private String title;
    private String fileName;
    private PrivateDocumentCategory category;
    private String description;
    private long size;
    private String contentType;
    private Instant createdAt;
    private Instant updatedAt;
}
