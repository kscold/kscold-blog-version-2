package com.kscold.blog.media.infrastructure.persistence;

import com.kscold.blog.media.domain.model.Media;
import com.kscold.blog.media.domain.port.out.MediaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MongoMediaRepository implements MediaRepository {

    private final SpringDataMediaRepository delegate;

    @Override
    public Media save(Media media) {
        return delegate.save(media);
    }

    @Override
    public Optional<Media> findByFileUrl(String fileUrl) {
        return delegate.findByFileUrl(fileUrl);
    }

    @Override
    public void delete(Media media) {
        delegate.delete(media);
    }
}

interface SpringDataMediaRepository extends MongoRepository<Media, String> {
    Optional<Media> findByFileUrl(String fileUrl);
}
