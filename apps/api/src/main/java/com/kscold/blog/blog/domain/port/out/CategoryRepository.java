package com.kscold.blog.blog.domain.port.out;

import com.kscold.blog.blog.domain.model.Category;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository {
    Optional<Category> findById(String id);
    Optional<Category> findBySlug(String slug);
    Category save(Category category);
    void delete(Category category);
    List<Category> findAll();
    List<Category> findByParentIsNull();
    List<Category> findByParentOrderByOrderAsc(String parentId);
    List<Category> findByParent(String parentId);
    List<Category> findByAncestorId(String ancestorId);
    List<Category> findByDepth(Integer depth);
    void incrementPostCount(String categoryId);
    void decrementPostCount(String categoryId);
}
