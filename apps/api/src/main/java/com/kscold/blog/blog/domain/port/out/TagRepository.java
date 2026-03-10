package com.kscold.blog.blog.domain.port.out;

import com.kscold.blog.blog.domain.model.Tag;

import java.util.List;
import java.util.Optional;

public interface TagRepository {
    Optional<Tag> findById(String id);
    Optional<Tag> findBySlug(String slug);
    Optional<Tag> findByName(String name);
    Tag save(Tag tag);
    void delete(Tag tag);
    List<Tag> findAll();
    List<Tag> findAllById(Iterable<String> ids);
    void incrementPostCount(String tagId);
    void decrementPostCount(String tagId);
}
