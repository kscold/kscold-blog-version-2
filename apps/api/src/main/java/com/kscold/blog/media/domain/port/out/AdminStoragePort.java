package com.kscold.blog.media.domain.port.out;

import com.kscold.blog.media.application.dto.AdminStorageListing;
import com.kscold.blog.media.application.dto.AdminStorageObjectResource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AdminStoragePort {
    AdminStorageListing list(String prefix);
    void createFolder(String prefix, String folderName);
    void uploadFiles(String prefix, List<MultipartFile> files);
    int deleteEntry(String key);
    AdminStorageObjectResource getObject(String key);
}
