package com.kscold.blog.blog.adapter.in.web;

import com.kscold.blog.blog.application.dto.CategoryCreateCommand;
import com.kscold.blog.blog.application.dto.CategoryMoveCommand;
import com.kscold.blog.blog.application.dto.CategoryUpdateCommand;
import com.kscold.blog.blog.application.port.in.CategoryUseCase;
import com.kscold.blog.blog.domain.model.Category;
import com.kscold.blog.blog.adapter.in.web.dto.CategoryResponse;
import com.kscold.blog.shared.web.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryUseCase categoryUseCase;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<Category> categories = categoryUseCase.getAll();
        return ResponseEntity.ok(ApiResponse.success(CategoryResponse.buildTree(categories)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable String id) {
        Category category = categoryUseCase.getById(id);
        return ResponseEntity.ok(ApiResponse.success(CategoryResponse.from(category)));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryBySlug(@PathVariable String slug) {
        Category category = categoryUseCase.getBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(CategoryResponse.from(category)));
    }

    @GetMapping("/parent/{parentId}")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategoriesByParent(@PathVariable String parentId) {
        List<Category> categories = categoryUseCase.getByParent(parentId);
        return ResponseEntity.ok(ApiResponse.success(CategoryResponse.from(categories)));
    }

    @GetMapping("/root")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getRootCategories() {
        List<Category> categories = categoryUseCase.getByParent(null);
        return ResponseEntity.ok(ApiResponse.success(CategoryResponse.from(categories)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryCreateCommand command
    ) {
        Category created = categoryUseCase.create(command);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(CategoryResponse.from(created), "카테고리가 생성되었습니다"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable String id,
            @Valid @RequestBody CategoryUpdateCommand command
    ) {
        Category updated = categoryUseCase.update(id, command);
        return ResponseEntity.ok(ApiResponse.success(CategoryResponse.from(updated), "카테고리가 수정되었습니다"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        categoryUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/move")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> moveCategory(
            @PathVariable String id,
            @Valid @RequestBody CategoryMoveCommand command
    ) {
        Category moved = categoryUseCase.move(id, command.getNewParentId());
        return ResponseEntity.ok(ApiResponse.success(CategoryResponse.from(moved), "카테고리가 이동되었습니다"));
    }
}
