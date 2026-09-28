package com.kscold.blog.documents.adapter.out.persistence;

import com.kscold.blog.documents.domain.model.PrivateDocument;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoPrivateDocumentRepository extends MongoRepository<PrivateDocument, String> {

    Optional<PrivateDocument> findByIdAndOwnerId(String id, String ownerId);

    void deleteByIdAndOwnerId(String id, String ownerId);
}
