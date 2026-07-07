package com.kscold.blog.media.application.port.in;

import com.kscold.blog.media.application.dto.AdminStorageListing;
import com.kscold.blog.media.application.dto.AdminStorageObjectResource;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface AdminStorageUseCase {
    AdminStorageListing getListing(String prefix);

    AdminStorageListing createFolder(String prefix, String folderName);

    AdminStorageListing uploadFiles(String prefix, List<MultipartFile> files);

    AdminStorageListing deleteEntry(String prefix, String key);

    AdminStorageObjectResource getObject(String key);
}
