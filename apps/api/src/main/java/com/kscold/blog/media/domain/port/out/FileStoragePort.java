package com.kscold.blog.media.domain.port.out;

import org.springframework.web.multipart.MultipartFile;

public interface FileStoragePort {
    String store(MultipartFile file);
    void delete(String fileUrl);
}
