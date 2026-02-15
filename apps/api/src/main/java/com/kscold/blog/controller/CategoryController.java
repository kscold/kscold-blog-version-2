package com.kscold.blog.controller;

import com.kscold.blog.dto.request.CategoryCreateRequest;
import com.kscold.blog.dto.request.CategoryMoveRequest;
import com.kscold.blog.dto.request.CategoryUpdateRequest;
import com.kscold.blog.dto.response.ApiResponse;
import com.kscold.blog.dto.response.CategoryResponse;
import com.kscold.blog.model.Category;
import com.kscold.blog.service.CategoryService;
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

    private final CategoryService categoryService;

    /**
     * 전체 카테고리 조회 (계층 구조)
     * GET /api/categories
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<Category> categories = categoryService.getTree();
        List<CategoryResponse> response = CategoryResponse.from(categories);
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
        Category category = categoryService.getById(id);
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
        Category category = categoryService.getBySlug(slug);
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
        List<Category> categories = categoryService.getByParent(parentId);
        List<CategoryResponse> response = CategoryResponse.from(categories);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 루트 카테고리 조회
     * GET /api/categories/root
     */
    @GetMapping("/root")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getRootCategories() {
        List<Category> categories = categoryService.getByParent(null);
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
            @Valid @RequestBody CategoryCreateRequest request
    ) {
        Category category = Category.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .parent(request.getParent())
                .order(request.getOrder())
                .icon(request.getIcon())
                .color(request.getColor())
                .build();

        Category created = categoryService.create(category);
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
            @Valid @RequestBody CategoryUpdateRequest request
    ) {
        Category category = Category.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .order(request.getOrder())
                .icon(request.getIcon())
                .color(request.getColor())
                .build();

        Category updated = categoryService.update(id, category);
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
        categoryService.delete(id);
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
            @Valid @RequestBody CategoryMoveRequest request
    ) {
        Category moved = categoryService.move(id, request.getNewParentId());
        CategoryResponse response = CategoryResponse.from(moved);

        return ResponseEntity.ok(ApiResponse.success(response, "카테고리가 이동되었습니다"));
    }
}
