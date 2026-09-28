package com.kscold.blog.documents.domain.port.out;

import com.kscold.blog.documents.domain.model.PrivateDocumentFile;
import java.io.InputStream;

public interface PrivateDocumentStoragePort {

    void upload(String key, PrivateDocumentFile file);

    InputStream download(String key);

    void delete(String key);
}
