package com.kscold.blog.media.domain.port.out;

import com.kscold.blog.media.domain.model.Media;

import java.util.Optional;

public interface MediaRepository {
    Media save(Media media);
    Optional<Media> findByFileUrl(String fileUrl);
    void delete(Media media);
}
