package com.kscold.blog.repository;

import com.kscold.blog.model.Tag;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TagRepository extends MongoRepository<Tag, String> {
    Optional<Tag> findByName(String name);
    Optional<Tag> findBySlug(String slug);
}
