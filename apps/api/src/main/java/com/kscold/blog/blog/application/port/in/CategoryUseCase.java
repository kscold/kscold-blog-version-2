package com.kscold.blog.blog.application.port.in;

import com.kscold.blog.blog.application.dto.CategoryCreateCommand;
import com.kscold.blog.blog.application.dto.CategoryUpdateCommand;
import com.kscold.blog.blog.domain.model.Category;

import java.util.List;

public interface CategoryUseCase {

    List<Category> getAll();

    List<Category> getByParent(String parentId);

    Category getById(String id);

    Category getBySlug(String slug);

    Category create(CategoryCreateCommand command);

    Category update(String id, CategoryUpdateCommand command);

    void delete(String id);

    Category move(String id, String newParentId);

    void incrementPostCount(String categoryId);

    void decrementPostCount(String categoryId);
}
