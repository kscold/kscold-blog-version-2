package com.kscold.blog.blog.adapter.out.persistence;

import com.kscold.blog.blog.domain.model.Tag;
import com.kscold.blog.blog.domain.port.out.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * TagRepository 포트의 영속성 어댑터
 * Spring Data MongoDB를 사용하여 포트 인터페이스를 구현
 */
@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class TagRepositoryAdapter implements TagRepository {

    private final MongoTagRepository mongoTagRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public Tag save(Tag tag) {
        return mongoTagRepository.save(tag);
    }

    @Override
    public Optional<Tag> findById(String id) {
        return mongoTagRepository.findById(id);
    }

    @Override
    public List<Tag> findAll() {
        return mongoTagRepository.findAll();
    }

    @Override
    public Optional<Tag> findByName(String name) {
        return mongoTagRepository.findByName(name);
    }

    @Override
    public Optional<Tag> findBySlug(String slug) {
        return mongoTagRepository.findBySlug(slug);
    }

    @Override
    public List<Tag> findAllById(Iterable<String> ids) {
        return mongoTagRepository.findAllById(ids);
    }

    @Override
    public void delete(Tag tag) {
        mongoTagRepository.delete(tag);
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
