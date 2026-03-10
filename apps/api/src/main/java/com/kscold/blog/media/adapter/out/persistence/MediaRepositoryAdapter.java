package com.kscold.blog.media.adapter.out.persistence;

import com.kscold.blog.media.domain.model.Media;
import com.kscold.blog.media.domain.port.out.MediaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class MediaRepositoryAdapter implements MediaRepository {

    private final MongoMediaRepository mongoMediaRepository;

    @Override
    public Media save(Media media) {
        return mongoMediaRepository.save(media);
    }

    @Override
    public Optional<Media> findById(String id) {
        return mongoMediaRepository.findById(id);
    }

    @Override
    public Optional<Media> findByFileUrl(String fileUrl) {
        return mongoMediaRepository.findByFileUrl(fileUrl);
    }

    @Override
    public List<Media> findAll() {
        return mongoMediaRepository.findAll();
    }

    @Override
    public void delete(Media media) {
        mongoMediaRepository.delete(media);
    }
}
