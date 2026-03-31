package com.kscold.blog.blog.application.service;

import com.kscold.blog.blog.application.port.in.AccessRequestUseCase;
import com.kscold.blog.blog.domain.model.AccessRequest;
import com.kscold.blog.blog.domain.model.Category;
import com.kscold.blog.blog.domain.port.out.AccessRequestRepository;
import com.kscold.blog.blog.application.port.in.CategoryUseCase;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccessRequestService implements AccessRequestUseCase {

    private final AccessRequestRepository accessRequestRepository;
    private final CategoryUseCase categoryUseCase;
    private final UserQueryPort userQueryPort;

    @Override
    public AccessRequest requestAccess(String userId, String categoryId, String message) {
        var existing = accessRequestRepository.findByUserIdAndCategoryId(userId, categoryId);
        if (existing.isPresent()) {
            AccessRequest req = existing.get();
            if (req.getStatus() == AccessRequest.Status.APPROVED) {
                throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "이미 승인된 요청입니다");
            }
            if (req.getStatus() == AccessRequest.Status.PENDING) {
                throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "이미 대기 중인 요청이 있습니다");
            }
            req.setStatus(AccessRequest.Status.PENDING);
            req.setMessage(message);
            return accessRequestRepository.save(req);
        }

        Category category = categoryUseCase.getById(categoryId);
        UserQueryPort.UserInfo user = userQueryPort.getUserById(userId);

        AccessRequest request = AccessRequest.builder()
                .userId(userId)
                .username(user.displayName())
                .categoryId(categoryId)
                .categoryName(category.getName())
                .message(message)
                .build();

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

        return accessRequestRepository.findByUserIdAndCategoryId(userId, categoryId)
                .map(r -> r.getStatus() == AccessRequest.Status.APPROVED)
                .orElse(false);
    }

    @Override
    public List<AccessRequest> getPendingRequests() {
        return accessRequestRepository.findByStatus(AccessRequest.Status.PENDING);
    }

    @Override
    public List<AccessRequest> getMyRequests(String userId) {
        return accessRequestRepository.findByUserId(userId);
    }

    @Override
    public AccessRequest approve(String requestId) {
        AccessRequest request = accessRequestRepository.findById(requestId)
                .orElseThrow(() -> new InvalidRequestException(ErrorCode.RESOURCE_NOT_FOUND, "요청을 찾을 수 없습니다"));
        request.setStatus(AccessRequest.Status.APPROVED);
        return accessRequestRepository.save(request);
    }

    @Override
    public AccessRequest reject(String requestId) {
        AccessRequest request = accessRequestRepository.findById(requestId)
                .orElseThrow(() -> new InvalidRequestException(ErrorCode.RESOURCE_NOT_FOUND, "요청을 찾을 수 없습니다"));
        request.setStatus(AccessRequest.Status.REJECTED);
        return accessRequestRepository.save(request);
    }
}
