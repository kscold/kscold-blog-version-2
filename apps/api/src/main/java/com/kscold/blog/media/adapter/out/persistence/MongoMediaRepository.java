package com.kscold.blog.media.adapter.out.persistence;

import com.kscold.blog.media.domain.model.Media;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface MongoMediaRepository extends MongoRepository<Media, String> {
    Optional<Media> findByFileUrl(String fileUrl);
}
