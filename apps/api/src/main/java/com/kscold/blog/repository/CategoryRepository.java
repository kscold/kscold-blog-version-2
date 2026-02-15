package com.kscold.blog.repository;

import com.kscold.blog.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends MongoRepository<Category, String> {
    Optional<Category> findBySlug(String slug);

    List<Category> findByParentIsNull();

    List<Category> findByParent(String parentId);

    @Query("{ 'ancestors': ?0 }")
    List<Category> findByAncestorId(String ancestorId);

    List<Category> findByDepth(Integer depth);

    List<Category> findByParentOrderByOrderAsc(String parentId);
}
