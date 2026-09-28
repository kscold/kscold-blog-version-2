package com.kscold.blog.documents.domain.port.out;

import com.kscold.blog.documents.domain.model.PrivateDocument;
import com.kscold.blog.documents.domain.model.PrivateDocumentMetadata;
import com.kscold.blog.documents.domain.model.PrivateDocumentSearchCriteria;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PrivateDocumentRepository {

    PrivateDocument save(PrivateDocument document);

    Page<PrivateDocument> findAll(PrivateDocumentSearchCriteria criteria, Pageable pageable);

    Optional<PrivateDocument> findByIdAndOwnerId(String id, String ownerId);

    Optional<PrivateDocument> updateMetadata(
            String id, String ownerId, PrivateDocumentMetadata metadata);

    void deleteByIdAndOwnerId(String id, String ownerId);
}
