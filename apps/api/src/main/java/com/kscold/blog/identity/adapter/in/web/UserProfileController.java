package com.kscold.blog.identity.adapter.in.web;

import com.kscold.blog.identity.application.dto.AuthResult;
import com.kscold.blog.identity.application.dto.PublicProfileDto;
import com.kscold.blog.identity.application.dto.UpdateProfileCommand;
import com.kscold.blog.identity.application.port.in.UserManagementUseCase;
import com.kscold.blog.identity.application.port.in.UserProfileUseCase;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.social.adapter.in.web.dto.FeedResponse;
import com.kscold.blog.social.application.port.in.FeedUseCase;
import com.kscold.blog.social.domain.model.Feed;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileUseCase userProfileUseCase;
    private final UserManagementUseCase userManagementUseCase;
    private final FeedUseCase feedUseCase;

    @PatchMapping("/me/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AuthResult.UserInfo>> updateMyProfile(
            @AuthenticationPrincipal String userId, @RequestBody UpdateProfileCommand command) {
        AuthResult.UserInfo updated = userProfileUseCase.updateMyProfile(userId, command);
        return ResponseEntity.ok(ApiResponse.success(updated, "프로필이 업데이트되었습니다"));
    }

    @GetMapping("/tech-stacks")
    public ResponseEntity<ApiResponse<List<String>>> getTechStacks() {
        return ResponseEntity.ok(ApiResponse.success(userProfileUseCase.getAllTechStacks()));
    }

    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> withdrawMyAccount(
            @AuthenticationPrincipal String userId) {
        userManagementUseCase.softDelete(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "계정이 탈퇴 처리되었습니다"));
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<ApiResponse<PublicProfileDto>> getPublicProfile(
            @PathVariable String username) {
        return ResponseEntity.ok(
                ApiResponse.success(userProfileUseCase.getPublicProfile(username)));
    }

    @GetMapping("/{username}/feeds")
    public ResponseEntity<ApiResponse<Page<FeedResponse>>> getUserFeeds(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        PublicProfileDto profile = userProfileUseCase.getPublicProfile(username);
        Page<Feed> feeds =
                feedUseCase.getPublicFeedsByAuthorId(
                        profile.id(),
                        PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        // 작성자(=프로필 주인)의 최신 프로필로 피드 작성자 정보를 채운다.
        UserQueryPort.UserInfo author =
                new UserQueryPort.UserInfo(
                        profile.id(),
                        profile.username(),
                        profile.displayName(),
                        profile.avatar(),
                        false,
                        null);
        return ResponseEntity.ok(
                ApiResponse.success(feeds.map(feed -> FeedResponse.from(feed, null, author))));
    }
}
