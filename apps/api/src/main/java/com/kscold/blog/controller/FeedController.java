package com.kscold.blog.controller;

import com.kscold.blog.dto.request.FeedCreateRequest;
import com.kscold.blog.dto.request.FeedUpdateRequest;
import com.kscold.blog.dto.response.ApiResponse;
import com.kscold.blog.dto.response.FeedResponse;
import com.kscold.blog.model.Feed;
import com.kscold.blog.service.FeedService;
import jakarta.servlet.http.HttpServletRequest;
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

@RestController
@RequestMapping("/api/feeds")
@RequiredArgsConstructor
public class FeedController {

    private final FeedService feedService;

    /**
     * 공개 피드 목록 조회
     * GET /api/feeds?page=0&size=12
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<FeedResponse>>> getPublicFeeds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            HttpServletRequest request
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Feed> feeds = feedService.getPublicFeeds(pageable);
        String identifier = getClientIdentifier(request);
        Page<FeedResponse> response = feeds.map(feed -> FeedResponse.from(feed, identifier));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 관리자용 전체 피드 목록 (비공개 포함)
     * GET /api/feeds/admin?page=0&size=12
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<FeedResponse>>> getAllFeeds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Feed> feeds = feedService.getAllFeeds(pageable);
        Page<FeedResponse> response = feeds.map(FeedResponse::from);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 피드 상세 조회
     * GET /api/feeds/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FeedResponse>> getFeedById(
            @PathVariable String id,
            HttpServletRequest request
    ) {
        Feed feed = feedService.getById(id);
        String identifier = getClientIdentifier(request);
        FeedResponse response = FeedResponse.from(feed, identifier);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 피드 생성 (ADMIN)
     * POST /api/feeds
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FeedResponse>> createFeed(
            @Valid @RequestBody FeedCreateRequest request,
            @AuthenticationPrincipal String userId
    ) {
        Feed feed = feedService.create(request, userId);
        FeedResponse response = FeedResponse.from(feed);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "피드가 생성되었습니다"));
    }

    /**
     * 피드 수정 (ADMIN)
     * PUT /api/feeds/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FeedResponse>> updateFeed(
            @PathVariable String id,
            @Valid @RequestBody FeedUpdateRequest request
    ) {
        Feed feed = feedService.update(id, request);
        FeedResponse response = FeedResponse.from(feed);
        return ResponseEntity.ok(ApiResponse.success(response, "피드가 수정되었습니다"));
    }

    /**
     * 피드 삭제 (ADMIN)
     * DELETE /api/feeds/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFeed(@PathVariable String id) {
        feedService.delete(id);
        return ResponseEntity.ok(ApiResponse.successWithMessage("피드가 삭제되었습니다"));
    }

    /**
     * 좋아요 토글 (IP 기반)
     * POST /api/feeds/{id}/like
     */
    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<FeedResponse>> toggleLike(
            @PathVariable String id,
            HttpServletRequest request
    ) {
        String identifier = getClientIdentifier(request);
        Feed feed = feedService.toggleLike(id, identifier);
        FeedResponse response = FeedResponse.from(feed, identifier);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private String getClientIdentifier(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
