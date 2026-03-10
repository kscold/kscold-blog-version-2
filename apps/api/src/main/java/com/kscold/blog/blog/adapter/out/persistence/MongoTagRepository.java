package com.kscold.blog.blog.adapter.out.persistence;

import com.kscold.blog.blog.domain.model.Tag;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface MongoTagRepository extends MongoRepository<Tag, String> {

    Optional<Tag> findByName(String name);

    Optional<Tag> findBySlug(String slug);
}
