package com.kscold.blog.blog.application.service;

import com.kscold.blog.blog.application.port.in.AccessRequestUseCase;
import com.kscold.blog.blog.application.port.in.PostUseCase;
import com.kscold.blog.blog.domain.model.AccessRequest;
import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.blog.application.port.out.AccessRequestMailSender;
import com.kscold.blog.blog.domain.port.out.AccessRequestRepository;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccessRequestService implements AccessRequestUseCase {

    private final AccessRequestRepository accessRequestRepository;
    private final PostUseCase postUseCase;
    private final UserQueryPort userQueryPort;
    private final AccessRequestMailSender accessRequestMailSender;

    @Override
    public AccessRequest requestAccess(String userId, String postId, String message) {
        if (!StringUtils.hasText(userId)) {
            throw InvalidRequestException.invalidInput("로그인이 필요합니다");
        }
        if (!StringUtils.hasText(postId)) {
            throw InvalidRequestException.missingInput("postId");
        }

        Post post = postUseCase.getById(postId);
        if (post.getCategory() == null || !StringUtils.hasText(post.getCategory().getId())) {
            throw InvalidRequestException.invalidInput("카테고리 정보가 없는 글은 열람 요청을 받을 수 없습니다");
        }

        String categoryId = post.getCategory().getId();
        UserQueryPort.UserInfo user = userQueryPort.getUserById(userId);

        if (hasAccess(userId, postId, categoryId)) {
            throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "이미 승인된 요청입니다");
        }

        var existingPostRequest = accessRequestRepository.findByUserIdAndPostId(userId, postId);
        if (existingPostRequest.isPresent()) {
            return reopenExistingRequest(existingPostRequest.get(), user.displayName(), message, post);
        }

        AccessRequest request = AccessRequest.builder()
                .userId(userId)
                .username(user.displayName())
                .message(message)
                .grantScope(AccessRequest.GrantScope.POST)
                .build();

        applyPostContext(request, post);
        return accessRequestRepository.save(request);
    }

    @Override
    public boolean hasAccess(String userId, String categoryId) {
        if (userId == null) return false;

        try {
            if (userQueryPort.getUserById(userId).isAdmin()) return true;
        } catch (Exception ignored) {
            return false;
        }

        return accessRequestRepository.findAllByUserIdAndCategoryId(userId, categoryId).stream()
                .anyMatch(request -> grantsCategoryAccess(request, categoryId));
    }

    @Override
    public boolean hasAccess(String userId, String postId, String categoryId) {
        if (!StringUtils.hasText(userId)) {
            return false;
        }
        if (isAdmin(userId)) {
            return true;
        }
        if (StringUtils.hasText(categoryId) && hasAccess(userId, categoryId)) {
            return true;
        }
        if (!StringUtils.hasText(postId)) {
            return false;
        }

        return accessRequestRepository.findByUserIdAndPostId(userId, postId)
                .map(request -> grantsPostAccess(request, postId))
                .orElse(false);
    }

    @Override
    public List<AccessRequest> getPendingRequests() {
        return accessRequestRepository.findByStatusOrderByCreatedAtDesc(AccessRequest.Status.PENDING);
    }

    @Override
    public List<AccessRequest> getMyRequests(String userId) {
        return accessRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public AccessRequest approve(String requestId, AccessRequest.GrantScope grantScope) {
        AccessRequest request = accessRequestRepository.findById(requestId)
                .orElseThrow(() -> new InvalidRequestException(ErrorCode.RESOURCE_NOT_FOUND, "요청을 찾을 수 없습니다"));
        AccessRequest.GrantScope resolvedScope = resolveGrantScope(request, grantScope);
        request.setStatus(AccessRequest.Status.APPROVED);
        request.setGrantScope(resolvedScope);
        AccessRequest saved = accessRequestRepository.save(request);
        notifyApproved(saved);
        return saved;
    }

    private void notifyApproved(AccessRequest request) {
        try {
            UserQueryPort.UserInfo user = userQueryPort.getUserById(request.getUserId());
            accessRequestMailSender.sendApproved(user.email(), user.displayName(), request);
        } catch (Exception e) {
            log.warn("승인 메일 발송 실패 (userId={}): {}", request.getUserId(), e.getMessage());
        }
    }

    @Override
    public AccessRequest reject(String requestId) {
        AccessRequest request = accessRequestRepository.findById(requestId)
                .orElseThrow(() -> new InvalidRequestException(ErrorCode.RESOURCE_NOT_FOUND, "요청을 찾을 수 없습니다"));
        request.setStatus(AccessRequest.Status.REJECTED);
        return accessRequestRepository.save(request);
    }

    private AccessRequest reopenExistingRequest(AccessRequest request, String username, String message, Post post) {
        if (request.getStatus() == AccessRequest.Status.APPROVED) {
            throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "이미 승인된 요청입니다");
        }
        if (request.getStatus() == AccessRequest.Status.PENDING) {
            throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "이미 대기 중인 요청이 있습니다");
        }

        request.setStatus(AccessRequest.Status.PENDING);
        request.setUsername(username);
        request.setMessage(message);
        applyPostContext(request, post);
        request.setGrantScope(AccessRequest.GrantScope.POST);
        return accessRequestRepository.save(request);
    }

    private void applyPostContext(AccessRequest request, Post post) {
        request.setPostId(post.getId());
        request.setPostTitle(post.getTitle());
        request.setPostSlug(post.getSlug());
        request.setCategoryId(post.getCategory().getId());
        request.setCategoryName(post.getCategory().getName());
    }

    private boolean isAdmin(String userId) {
        try {
            return userQueryPort.getUserById(userId).isAdmin();
        } catch (Exception ignored) {
            return false;
        }
    }

    private boolean grantsCategoryAccess(AccessRequest request, String categoryId) {
        if (request.getStatus() != AccessRequest.Status.APPROVED) {
            return false;
        }
        if (!Objects.equals(request.getCategoryId(), categoryId)) {
            return false;
        }

        return request.getGrantScope() == AccessRequest.GrantScope.CATEGORY;
    }

    private boolean grantsPostAccess(AccessRequest request, String postId) {
        if (request.getStatus() != AccessRequest.Status.APPROVED) {
            return false;
        }
        if (!Objects.equals(request.getPostId(), postId)) {
            return false;
        }

        return request.getGrantScope() == AccessRequest.GrantScope.POST;
    }

    private AccessRequest.GrantScope resolveGrantScope(AccessRequest request, AccessRequest.GrantScope requestedScope) {
        AccessRequest.GrantScope scope = requestedScope != null ? requestedScope : request.getGrantScope();
        if (scope == null) {
            throw InvalidRequestException.invalidInput("승인 범위를 찾을 수 없습니다");
        }

        if (scope == AccessRequest.GrantScope.POST && !StringUtils.hasText(request.getPostId())) {
            throw InvalidRequestException.invalidInput("포스트 정보가 없는 요청은 글 단위로 승인할 수 없습니다");
        }

        if (scope == AccessRequest.GrantScope.CATEGORY && !StringUtils.hasText(request.getCategoryId())) {
            throw InvalidRequestException.invalidInput("카테고리 정보가 없는 요청은 카테고리 단위로 승인할 수 없습니다");
        }

        return scope;
    }
}
