package com.kscold.blog.blog.adapter.out.persistence;

import com.kscold.blog.blog.domain.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MongoCategoryRepository extends MongoRepository<Category, String> {

    Optional<Category> findBySlug(String slug);

    List<Category> findByParentIsNull();

    List<Category> findByParent(String parentId);

    @Query("{ 'ancestors': ?0 }")
    List<Category> findByAncestorId(String ancestorId);

    List<Category> findByDepth(Integer depth);

    List<Category> findByParentOrderByOrderAsc(String parentId);
}
