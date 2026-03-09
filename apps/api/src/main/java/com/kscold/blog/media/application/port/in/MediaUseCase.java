package com.kscold.blog.media.application.port.in;

import com.kscold.blog.media.domain.model.Media;
import org.springframework.web.multipart.MultipartFile;

public interface MediaUseCase {

    Media upload(MultipartFile file, String uploaderId, String uploaderName);

    void delete(String fileUrl);
}
