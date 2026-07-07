package com.kscold.blog.blog.adapter.out.persistence;

import com.kscold.blog.blog.domain.model.Tag;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoTagRepository extends MongoRepository<Tag, String> {

    Optional<Tag> findByName(String name);

    Optional<Tag> findBySlug(String slug);
}
