package com.kscold.blog.blog.adapter.out.persistence;

import com.kscold.blog.blog.domain.model.Category;
import com.kscold.blog.blog.domain.port.out.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * CategoryRepository 포트의 영속성 어댑터
 * Spring Data MongoDB를 사용하여 포트 인터페이스를 구현
 */
@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class CategoryRepositoryAdapter implements CategoryRepository {

    private final MongoCategoryRepository mongoCategoryRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public Category save(Category category) {
        return mongoCategoryRepository.save(category);
    }

    @Override
    public Optional<Category> findById(String id) {
        return mongoCategoryRepository.findById(id);
    }

    @Override
    public List<Category> findAll() {
        return mongoCategoryRepository.findAll();
    }

    @Override
    public Optional<Category> findBySlug(String slug) {
        return mongoCategoryRepository.findBySlug(slug);
    }

    @Override
    public List<Category> findByParentIsNull() {
        return mongoCategoryRepository.findByParentIsNull();
    }

    @Override
    public List<Category> findByParent(String parentId) {
        return mongoCategoryRepository.findByParent(parentId);
    }

    @Override
    public List<Category> findByParentOrderByOrderAsc(String parentId) {
        return mongoCategoryRepository.findByParentOrderByOrderAsc(parentId);
    }

    @Override
    public List<Category> findByAncestorId(String ancestorId) {
        return mongoCategoryRepository.findByAncestorId(ancestorId);
    }

    @Override
    public List<Category> findByDepth(Integer depth) {
        return mongoCategoryRepository.findByDepth(depth);
    }

    @Override
    public void delete(Category category) {
        mongoCategoryRepository.delete(category);
    }

    @Override
    public void incrementPostCount(String categoryId) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(categoryId)),
                new Update().inc("postCount", 1),
                Category.class
        );
    }

    @Override
    public void decrementPostCount(String categoryId) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(categoryId).and("postCount").gt(0)),
                new Update().inc("postCount", -1),
                Category.class
        );
    }
}
