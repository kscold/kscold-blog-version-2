package com.kscold.blog.blog.infrastructure.persistence;

import com.kscold.blog.blog.domain.model.Category;
import com.kscold.blog.blog.domain.port.out.CategoryRepository;
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
public class MongoCategoryRepository implements CategoryRepository {

    private final SpringDataCategoryRepository delegate;
    private final MongoTemplate mongoTemplate;

    @Override
    public Optional<Category> findById(String id) {
        return delegate.findById(id);
    }

    @Override
    public Optional<Category> findBySlug(String slug) {
        return delegate.findBySlug(slug);
    }

    @Override
    public Category save(Category category) {
        return delegate.save(category);
    }

    @Override
    public void delete(Category category) {
        delegate.delete(category);
    }

    @Override
    public List<Category> findAll() {
        return delegate.findAll();
    }

    @Override
    public List<Category> findByParentIsNull() {
        return delegate.findByParentIsNull();
    }

    @Override
    public List<Category> findByParentOrderByOrderAsc(String parentId) {
        return delegate.findByParentOrderByOrderAsc(parentId);
    }

    @Override
    public List<Category> findByParent(String parentId) {
        return delegate.findByParent(parentId);
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

interface SpringDataCategoryRepository extends MongoRepository<Category, String> {
    Optional<Category> findBySlug(String slug);
    List<Category> findByParentIsNull();
    List<Category> findByParentOrderByOrderAsc(String parent);
    List<Category> findByParent(String parent);
}
