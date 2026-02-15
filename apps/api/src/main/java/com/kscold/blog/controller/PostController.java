package com.kscold.blog.controller;

import com.kscold.blog.dto.request.PostCreateRequest;
import com.kscold.blog.dto.request.PostUpdateRequest;
import com.kscold.blog.dto.response.ApiResponse;
import com.kscold.blog.dto.response.PostResponse;
import com.kscold.blog.model.Post;
import com.kscold.blog.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 포스트 관련 REST API 컨트롤러
 */
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    /**
     * 전체 포스트 조회 (페이지네이션)
     * GET /api/posts?page=0&size=10&sort=publishedAt,desc
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "publishedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<Post> posts = postService.getAll(pageable);
        Page<PostResponse> response = posts.map(PostResponse::from);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 추천 포스트 조회
     * GET /api/posts/featured?limit=5
     */
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getFeaturedPosts(
            @RequestParam(defaultValue = "5") int limit
    ) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "publishedAt"));
        List<Post> posts = postService.getFeatured(pageable);
        List<PostResponse> response = PostResponse.from(posts);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 포스트 조회 (ID)
     * GET /api/posts/:id
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> getPostById(
            @PathVariable String id
    ) {
        Post post = postService.getById(id);
        PostResponse response = PostResponse.from(post);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 포스트 조회 (Slug)
     * GET /api/posts/slug/:slug
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<PostResponse>> getPostBySlug(
            @PathVariable String slug
    ) {
        Post post = postService.getBySlug(slug);
        PostResponse response = PostResponse.from(post);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 카테고리별 포스트 조회
     * GET /api/posts/category/:categoryId?page=0&size=10
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getPostsByCategory(
            @PathVariable String categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));
        Page<Post> posts = postService.getByCategory(categoryId, pageable);
        Page<PostResponse> response = posts.map(PostResponse::from);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 태그별 포스트 조회
     * GET /api/posts/tag/:tagId?page=0&size=10
     */
    @GetMapping("/tag/{tagId}")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getPostsByTag(
            @PathVariable String tagId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));
        Page<Post> posts = postService.getByTag(tagId, pageable);
        Page<PostResponse> response = posts.map(PostResponse::from);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 포스트 검색 (제목 + 내용 전문 검색)
     * GET /api/posts/search?q=keyword&page=0&size=10
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> searchPosts(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));
        Page<Post> posts = postService.search(q, pageable);
        Page<PostResponse> response = posts.map(PostResponse::from);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 포스트 생성 (ADMIN 권한 필요)
     * POST /api/posts
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @Valid @RequestBody PostCreateRequest request,
            @AuthenticationPrincipal String userId
    ) {
        Post post = postService.create(request, userId);
        PostResponse response = PostResponse.from(post);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "포스트가 생성되었습니다"));
    }

    /**
     * 포스트 수정 (ADMIN 권한 필요)
     * PUT /api/posts/:id
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @PathVariable String id,
            @Valid @RequestBody PostUpdateRequest request
    ) {
        Post post = postService.update(id, request);
        PostResponse response = PostResponse.from(post);

        return ResponseEntity.ok(ApiResponse.success(response, "포스트가 수정되었습니다"));
    }

    /**
     * 포스트 삭제 (ADMIN 권한 필요)
     * DELETE /api/posts/:id
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable String id
    ) {
        postService.delete(id);

        return ResponseEntity.ok(ApiResponse.successWithMessage("포스트가 삭제되었습니다"));
    }
}
