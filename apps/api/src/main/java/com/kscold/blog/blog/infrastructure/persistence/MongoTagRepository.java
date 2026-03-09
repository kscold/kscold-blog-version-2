package com.kscold.blog.blog.infrastructure.persistence;

import com.kscold.blog.blog.domain.model.Tag;
import com.kscold.blog.blog.domain.port.out.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MongoTagRepository implements TagRepository {

    private final SpringDataTagRepository delegate;
    private final MongoTemplate mongoTemplate;

    @Override
    public Optional<Tag> findById(String id) {
        return delegate.findById(id);
    }

    @Override
    public Optional<Tag> findBySlug(String slug) {
        return delegate.findBySlug(slug);
    }

    @Override
    public Optional<Tag> findByName(String name) {
        return delegate.findByName(name);
    }

    @Override
    public Tag save(Tag tag) {
        return delegate.save(tag);
    }

    @Override
    public void delete(Tag tag) {
        delegate.delete(tag);
    }

    @Override
    public List<Tag> findAll() {
        return delegate.findAll();
    }

    @Override
    public List<Tag> findAllById(List<String> ids) {
        return delegate.findAllById(ids);
    }

    @Override
    public void incrementPostCount(String tagId) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(tagId)),
                new Update().inc("postCount", 1),
                Tag.class
        );
    }

    @Override
    public void decrementPostCount(String tagId) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(tagId).and("postCount").gt(0)),
                new Update().inc("postCount", -1),
                Tag.class
        );
    }
}

interface SpringDataTagRepository extends MongoRepository<Tag, String> {
    Optional<Tag> findBySlug(String slug);
    Optional<Tag> findByName(String name);
}
