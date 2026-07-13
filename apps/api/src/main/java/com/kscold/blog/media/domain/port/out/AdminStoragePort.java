package com.kscold.blog.media.domain.port.out;

import com.kscold.blog.media.domain.model.AdminStorageListing;
import com.kscold.blog.media.domain.model.AdminStorageObjectResource;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface AdminStoragePort {
    AdminStorageListing list(String prefix);

    void createFolder(String prefix, String folderName);

    void uploadFiles(String prefix, List<MultipartFile> files);

    int deleteEntry(String key);

    AdminStorageObjectResource getObject(String key);
}
