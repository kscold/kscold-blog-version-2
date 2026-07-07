package com.kscold.blog.media.adapter.out.persistence;

import com.kscold.blog.media.domain.model.Media;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoMediaRepository extends MongoRepository<Media, String> {
    Optional<Media> findByFileUrl(String fileUrl);
}
