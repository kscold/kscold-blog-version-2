package com.kscold.blog.documents.application.port.in;

import com.kscold.blog.documents.application.dto.SearchPrivateDocumentsCommand;
import com.kscold.blog.documents.application.dto.UploadPrivateDocumentCommand;
import com.kscold.blog.documents.domain.model.PrivateDocument;
import com.kscold.blog.documents.domain.model.PrivateDocumentDownload;
import com.kscold.blog.documents.domain.model.PrivateDocumentMetadata;
import org.springframework.data.domain.Page;

public interface PrivateDocumentUseCase {

    Page<PrivateDocument> search(SearchPrivateDocumentsCommand command);

    PrivateDocument get(String ownerId, String id);

    PrivateDocument upload(UploadPrivateDocumentCommand command);

    PrivateDocument update(String ownerId, String id, PrivateDocumentMetadata metadata);

    void delete(String ownerId, String id);

    PrivateDocumentDownload download(String ownerId, String id);
}
