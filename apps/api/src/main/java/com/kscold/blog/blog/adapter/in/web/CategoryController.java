package com.kscold.blog.blog.adapter.in.web;

import com.kscold.blog.blog.application.dto.CategoryCreateCommand;
import com.kscold.blog.blog.application.dto.CategoryMoveCommand;
import com.kscold.blog.blog.application.dto.CategoryUpdateCommand;
import com.kscold.blog.blog.application.service.CategoryApplicationService;
import com.kscold.blog.blog.domain.model.Category;
import com.kscold.blog.dto.response.ApiResponse;
import com.kscold.blog.dto.response.CategoryResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 카테고리 관련 REST API 컨트롤러
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryApplicationService categoryApplicationService;

    /**
     * 전체 카테고리 조회 (계층 구조)
     * GET /api/categories
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<Category> categories = categoryApplicationService.getAll();
        List<CategoryResponse> response = CategoryResponse.buildTree(categories);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 특정 카테고리 조회 (ID)
     * GET /api/categories/:id
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(
            @PathVariable String id
    ) {
        Category category = categoryApplicationService.getById(id);
        CategoryResponse response = CategoryResponse.from(category);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 특정 카테고리 조회 (Slug)
     * GET /api/categories/slug/:slug
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryBySlug(
            @PathVariable String slug
    ) {
        Category category = categoryApplicationService.getBySlug(slug);
        CategoryResponse response = CategoryResponse.from(category);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 부모별 자식 카테고리 조회
     * GET /api/categories/parent/:parentId
     */
    @GetMapping("/parent/{parentId}")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategoriesByParent(
            @PathVariable String parentId
    ) {
        List<Category> categories = categoryApplicationService.getByParent(parentId);
        List<CategoryResponse> response = CategoryResponse.from(categories);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 루트 카테고리 조회
     * GET /api/categories/root
     */
    @GetMapping("/root")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getRootCategories() {
        List<Category> categories = categoryApplicationService.getByParent(null);
        List<CategoryResponse> response = CategoryResponse.from(categories);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 카테고리 생성 (ADMIN 권한 필요)
     * POST /api/categories
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryCreateCommand command
    ) {
        Category created = categoryApplicationService.create(command);
        CategoryResponse response = CategoryResponse.from(created);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "카테고리가 생성되었습니다"));
    }

    /**
     * 카테고리 수정 (ADMIN 권한 필요)
     * PUT /api/categories/:id
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable String id,
            @Valid @RequestBody CategoryUpdateCommand command
    ) {
        Category updated = categoryApplicationService.update(id, command);
        CategoryResponse response = CategoryResponse.from(updated);

        return ResponseEntity.ok(ApiResponse.success(response, "카테고리가 수정되었습니다"));
    }

    /**
     * 카테고리 삭제 (ADMIN 권한 필요)
     * DELETE /api/categories/:id
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @PathVariable String id
    ) {
        categoryApplicationService.delete(id);
        return ResponseEntity.ok(ApiResponse.successWithMessage("카테고리가 삭제되었습니다"));
    }

    /**
     * 카테고리 이동 (ADMIN 권한 필요)
     * PUT /api/categories/:id/move
     */
    @PutMapping("/{id}/move")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> moveCategory(
            @PathVariable String id,
            @Valid @RequestBody CategoryMoveCommand command
    ) {
        Category moved = categoryApplicationService.move(id, command.getNewParentId());
        CategoryResponse response = CategoryResponse.from(moved);

        return ResponseEntity.ok(ApiResponse.success(response, "카테고리가 이동되었습니다"));
    }
}
