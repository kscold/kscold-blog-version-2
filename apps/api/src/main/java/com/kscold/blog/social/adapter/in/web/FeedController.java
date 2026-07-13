package com.kscold.blog.social.adapter.in.web;

import com.kscold.blog.analytics.application.service.ViewCounter;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.shared.web.ClientIdentifierResolver;
import com.kscold.blog.social.adapter.in.web.dto.response.FeedResponse;
import com.kscold.blog.social.application.dto.FeedCreateCommand;
import com.kscold.blog.social.application.dto.FeedUpdateCommand;
import com.kscold.blog.social.application.port.in.FeedUseCase;
import com.kscold.blog.social.domain.model.Feed;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

@Slf4j
@RestController
@RequestMapping("/feeds")
@RequiredArgsConstructor
public class FeedController {

    private final FeedUseCase feedUseCase;
    private final ClientIdentifierResolver clientIdentifierResolver;
    private final ViewCounter viewCounter;
    private final UserQueryPort userQueryPort;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FeedResponse>>> getPublicFeeds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String tag,
            @AuthenticationPrincipal String userId,
            HttpServletRequest request) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Feed> feeds =
                (tag != null && !tag.isBlank())
                        ? feedUseCase.getPublicFeedsByTag(tag, pageable)
                        : feedUseCase.getPublicFeeds(pageable);
        String identifier = resolveIdentifier(userId, request);
        return ResponseEntity.ok(ApiResponse.success(toResponsePage(feeds, identifier)));
    }

    @GetMapping("/tags")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getFeedTags() {
        return ResponseEntity.ok(ApiResponse.success(feedUseCase.getFeedTags()));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<FeedResponse>>> getAllFeeds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Feed> feeds = feedUseCase.getAllFeeds(pageable);
        return ResponseEntity.ok(ApiResponse.success(toResponsePage(feeds, null)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FeedResponse>> getFeedById(
            @PathVariable String id,
            @AuthenticationPrincipal String userId,
            HttpServletRequest request) {
        Feed feed = feedUseCase.getById(id);
        String identifier = resolveIdentifier(userId, request);
        if (viewCounter.incrementIfUnique("feeds", feed.getId(), "FEED", identifier)) {
            feed.setViews(feed.getViews() + 1);
        }
        return ResponseEntity.ok(ApiResponse.success(toResponse(feed, identifier)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FeedResponse>> createFeed(
            @Valid @RequestBody FeedCreateCommand command, @AuthenticationPrincipal String userId) {
        Feed feed = feedUseCase.create(command, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toResponse(feed, userId), "피드가 생성되었습니다"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FeedResponse>> updateFeed(
            @PathVariable String id,
            @Valid @RequestBody FeedUpdateCommand command,
            @AuthenticationPrincipal String userId) {
        feedUseCase.validateOwnership(id, userId, hasAdminRole());
        Feed feed = feedUseCase.update(id, command);
        return ResponseEntity.ok(ApiResponse.success(toResponse(feed, userId), "피드가 수정되었습니다"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeed(
            @PathVariable String id, @AuthenticationPrincipal String userId) {
        feedUseCase.validateOwnership(id, userId, hasAdminRole());
        feedUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }

    private boolean hasAdminRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null
                && auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<FeedResponse>> toggleLike(
            @PathVariable String id,
            @AuthenticationPrincipal String userId,
            HttpServletRequest request) {
        String identifier = resolveIdentifier(userId, request);
        Feed feed = feedUseCase.toggleLike(id, identifier);
        return ResponseEntity.ok(ApiResponse.success(toResponse(feed, identifier)));
    }

    /** 로그인 유저 → userId, 비로그인 → IP */
    private String resolveIdentifier(String userId, HttpServletRequest request) {
        return (userId != null) ? userId : clientIdentifierResolver.resolve(request);
    }

    /** 작성자 최신 프로필을 안전하게 조회 (탈퇴·삭제 사용자는 null) */
    private UserQueryPort.UserInfo lookupAuthor(String authorId) {
        if (authorId == null) return null;
        try {
            return userQueryPort.getUserById(authorId);
        } catch (Exception e) {
            return null;
        }
    }

    /** 단건 피드를 작성자 최신 프로필로 채워 응답 변환 */
    private FeedResponse toResponse(Feed feed, String identifier) {
        String authorId = feed.getAuthor() != null ? feed.getAuthor().getId() : null;
        return FeedResponse.from(feed, identifier, lookupAuthor(authorId));
    }

    /** 피드 목록을 작성자별 최신 프로필로 채워 응답 변환 (작성자 batch 조회) */
    private Page<FeedResponse> toResponsePage(Page<Feed> feeds, String identifier) {
        Map<String, UserQueryPort.UserInfo> authors = new HashMap<>();
        for (Feed feed : feeds.getContent()) {
            String authorId = feed.getAuthor() != null ? feed.getAuthor().getId() : null;
            if (authorId != null && !authors.containsKey(authorId)) {
                authors.put(authorId, lookupAuthor(authorId));
            }
        }
        return feeds.map(
                feed -> {
                    String authorId = feed.getAuthor() != null ? feed.getAuthor().getId() : null;
                    return FeedResponse.from(
                            feed, identifier, authorId != null ? authors.get(authorId) : null);
                });
    }
}
