package com.kscold.blog.blog.adapter.in.web;

import com.kscold.blog.analytics.application.service.ViewCounter;
import com.kscold.blog.blog.adapter.in.web.dto.response.PostResponse;
import com.kscold.blog.blog.application.dto.command.PostCreateCommand;
import com.kscold.blog.blog.application.dto.command.PostUpdateCommand;
import com.kscold.blog.blog.application.port.in.AccessRequestUseCase;
import com.kscold.blog.blog.application.port.in.CategoryUseCase;
import com.kscold.blog.blog.application.port.in.PostUseCase;
import com.kscold.blog.blog.domain.model.Category;
import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.shared.web.ClientIdentifierResolver;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/** 포스트 관련 REST API 컨트롤러 */
@Slf4j
@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostUseCase postUseCase;
    private final AccessRequestUseCase accessRequestUseCase;
    private final CategoryUseCase categoryUseCase;
    private final ViewCounter viewCounter;
    private final ClientIdentifierResolver clientIdentifierResolver;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "publishedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        Sort.Direction direction =
                sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<Post> posts = postUseCase.getAll(pageable);
        return ResponseEntity.ok(ApiResponse.success(posts.map(this::toPublicPostResponse)));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getFeaturedPosts(
            @RequestParam(defaultValue = "5") int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "views"));
        List<Post> posts = postUseCase.getFeatured(pageable);
        return ResponseEntity.ok(
                ApiResponse.success(posts.stream().map(this::toPublicPostResponse).toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> getPostById(
            @PathVariable String id,
            @AuthenticationPrincipal String userId,
            HttpServletRequest request) {
        Post post = postUseCase.getById(id);
        recordView(post, request);
        return ResponseEntity.ok(ApiResponse.success(applyRestriction(post, userId)));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<PostResponse>> getPostBySlug(
            @PathVariable String slug,
            @AuthenticationPrincipal String userId,
            HttpServletRequest request) {
        Post post = postUseCase.getBySlug(slug);
        recordView(post, request);
        return ResponseEntity.ok(ApiResponse.success(applyRestriction(post, userId)));
    }

    private void recordView(Post post, HttpServletRequest request) {
        if (post.getStatus() != Post.Status.PUBLISHED) return;
        String ip = clientIdentifierResolver.resolve(request);
        if (viewCounter.incrementIfUnique("posts", post.getId(), "POST", ip)) {
            post.setViews(post.getViews() + 1); // 응답에 최신값 반영
        }
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getPostsByCategory(
            @PathVariable String categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));
        Page<Post> posts = postUseCase.getByCategory(categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.success(posts.map(this::toPublicPostResponse)));
    }

    @GetMapping("/tag/{tagId}")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getPostsByTag(
            @PathVariable String tagId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));
        Page<Post> posts = postUseCase.getByTag(tagId, pageable);
        return ResponseEntity.ok(ApiResponse.success(posts.map(this::toPublicPostResponse)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> searchPosts(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));
        Page<Post> posts = postUseCase.search(q, pageable);
        return ResponseEntity.ok(ApiResponse.success(posts.map(this::toPublicPostResponse)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @Valid @RequestBody PostCreateCommand command, @AuthenticationPrincipal String userId) {
        Post post = postUseCase.create(command, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toFullPostResponse(post), "포스트가 생성되었습니다"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @PathVariable String id, @Valid @RequestBody PostUpdateCommand command) {
        Post post = postUseCase.update(id, command);
        return ResponseEntity.ok(ApiResponse.success(toFullPostResponse(post), "포스트가 수정되었습니다"));
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
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> posts = postUseCase.getAllAdmin(pageable);
        return ResponseEntity.ok(ApiResponse.success(posts.map(this::toFullPostResponse)));
    }

    @GetMapping("/exists/slug/{slug}")
    public ResponseEntity<ApiResponse<Boolean>> checkSlugExists(@PathVariable String slug) {
        boolean exists = postUseCase.existsBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(exists));
    }

    private PostResponse applyRestriction(Post post, String userId) {
        boolean restrictedPost = isRestrictedPost(post);
        if (!restrictedPost) {
            return PostResponse.from(post);
        }
        if (hasAdminRole()
                || accessRequestUseCase.hasAccess(
                        userId, post.getId(), post.getCategory().getId())) {
            return PostResponse.from(post, true);
        }

        return PostResponse.restricted(post);
    }

    private PostResponse toPublicPostResponse(Post post) {
        if (isRestrictedPost(post)) {
            return PostResponse.restricted(post);
        }

        return PostResponse.from(post);
    }

    private PostResponse toFullPostResponse(Post post) {
        return PostResponse.from(post, isRestrictedPost(post));
    }

    private boolean isRestrictedPost(Post post) {
        if (post.getCategory() == null) return false;
        if (Boolean.TRUE.equals(post.getPublicOverride())) return false;

        try {
            Category category = categoryUseCase.getById(post.getCategory().getId());
            return Boolean.TRUE.equals(category.getRestricted());
        } catch (Exception ignored) {
            return false;
        }
    }

    private boolean hasAdminRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null
                && auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
