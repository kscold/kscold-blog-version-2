package com.kscold.blog.blog.adapter.in.web;

import com.kscold.blog.blog.application.dto.PostCreateCommand;
import com.kscold.blog.blog.application.dto.PostUpdateCommand;
import com.kscold.blog.blog.application.port.in.AccessRequestUseCase;
import com.kscold.blog.blog.application.port.in.CategoryUseCase;
import com.kscold.blog.blog.application.port.in.PostUseCase;
import com.kscold.blog.blog.domain.model.Category;
import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.blog.adapter.in.web.dto.PostResponse;
import com.kscold.blog.shared.web.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostUseCase postUseCase;
    private final AccessRequestUseCase accessRequestUseCase;
    private final CategoryUseCase categoryUseCase;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "publishedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<Post> posts = postUseCase.getAll(pageable);
        return ResponseEntity.ok(ApiResponse.success(posts.map(PostResponse::from)));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getFeaturedPosts(
            @RequestParam(defaultValue = "5") int limit
    ) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "publishedAt"));
        List<Post> posts = postUseCase.getFeatured(pageable);
        return ResponseEntity.ok(ApiResponse.success(PostResponse.from(posts)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> getPostById(
            @PathVariable String id,
            @AuthenticationPrincipal String userId
    ) {
        Post post = postUseCase.getById(id);
        return ResponseEntity.ok(ApiResponse.success(applyRestriction(post, userId)));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<PostResponse>> getPostBySlug(
            @PathVariable String slug,
            @AuthenticationPrincipal String userId
    ) {
        Post post = postUseCase.getBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(applyRestriction(post, userId)));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getPostsByCategory(
            @PathVariable String categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));
        Page<Post> posts = postUseCase.getByCategory(categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.success(posts.map(PostResponse::from)));
    }

    @GetMapping("/tag/{tagId}")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getPostsByTag(
            @PathVariable String tagId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));
        Page<Post> posts = postUseCase.getByTag(tagId, pageable);
        return ResponseEntity.ok(ApiResponse.success(posts.map(PostResponse::from)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> searchPosts(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));
        Page<Post> posts = postUseCase.search(q, pageable);
        return ResponseEntity.ok(ApiResponse.success(posts.map(PostResponse::from)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @Valid @RequestBody PostCreateCommand command,
            @AuthenticationPrincipal String userId
    ) {
        Post post = postUseCase.create(command, userId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(PostResponse.from(post), "포스트가 생성되었습니다"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @PathVariable String id,
            @Valid @RequestBody PostUpdateCommand command
    ) {
        Post post = postUseCase.update(id, command);
        return ResponseEntity.ok(ApiResponse.success(PostResponse.from(post), "포스트가 수정되었습니다"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        postUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getAdminPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> posts = postUseCase.getAllAdmin(pageable);
        return ResponseEntity.ok(ApiResponse.success(posts.map(PostResponse::from)));
    }

    @GetMapping("/exists/slug/{slug}")
    public ResponseEntity<ApiResponse<Boolean>> checkSlugExists(@PathVariable String slug) {
        boolean exists = postUseCase.existsBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(exists));
    }

    private PostResponse applyRestriction(Post post, String userId) {
        if (post.getCategory() == null) return PostResponse.from(post);
        try {
            Category category = categoryUseCase.getById(post.getCategory().getId());
            if (Boolean.TRUE.equals(category.getRestricted())
                    && !accessRequestUseCase.hasAccess(userId, post.getId(), category.getId())) {
                return PostResponse.restricted(post);
            }
        } catch (Exception ignored) {
        }
        return PostResponse.from(post);
    }
}
