package com.kscold.blog.social.adapter.in.web;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.social.adapter.in.web.dto.FeedResponse;
import com.kscold.blog.social.application.dto.FeedCreateCommand;
import com.kscold.blog.social.application.dto.FeedUpdateCommand;
import com.kscold.blog.social.application.port.in.FeedUseCase;
import com.kscold.blog.social.domain.model.Feed;
import jakarta.servlet.http.HttpServletRequest;
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

@Slf4j
@RestController
@RequestMapping("/api/feeds")
@RequiredArgsConstructor
public class FeedController {

    private final FeedUseCase feedUseCase;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FeedResponse>>> getPublicFeeds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            HttpServletRequest request
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Feed> feeds = feedUseCase.getPublicFeeds(pageable);
        String identifier = getClientIdentifier(request);
        return ResponseEntity.ok(ApiResponse.success(feeds.map(feed -> FeedResponse.from(feed, identifier))));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<FeedResponse>>> getAllFeeds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Feed> feeds = feedUseCase.getAllFeeds(pageable);
        return ResponseEntity.ok(ApiResponse.success(feeds.map(FeedResponse::from)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FeedResponse>> getFeedById(
            @PathVariable String id,
            HttpServletRequest request
    ) {
        Feed feed = feedUseCase.getById(id);
        String identifier = getClientIdentifier(request);
        return ResponseEntity.ok(ApiResponse.success(FeedResponse.from(feed, identifier)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FeedResponse>> createFeed(
            @Valid @RequestBody FeedCreateCommand command,
            @AuthenticationPrincipal String userId
    ) {
        Feed feed = feedUseCase.create(command, userId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(FeedResponse.from(feed), "피드가 생성되었습니다"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FeedResponse>> updateFeed(
            @PathVariable String id,
            @Valid @RequestBody FeedUpdateCommand command
    ) {
        Feed feed = feedUseCase.update(id, command);
        return ResponseEntity.ok(ApiResponse.success(FeedResponse.from(feed), "피드가 수정되었습니다"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFeed(@PathVariable String id) {
        feedUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<FeedResponse>> toggleLike(
            @PathVariable String id,
            HttpServletRequest request
    ) {
        String identifier = getClientIdentifier(request);
        Feed feed = feedUseCase.toggleLike(id, identifier);
        return ResponseEntity.ok(ApiResponse.success(FeedResponse.from(feed, identifier)));
    }

    private String getClientIdentifier(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
