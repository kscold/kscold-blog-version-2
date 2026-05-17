package com.kscold.blog.blog.application.port.in;

import com.kscold.blog.blog.domain.model.AccessRequest;
import org.springframework.lang.Nullable;

import java.util.List;

public interface AccessRequestUseCase {

    AccessRequest requestAccess(String userId, String postId, String message);

    boolean hasAccess(@Nullable String userId, String categoryId);

    boolean hasAccess(String userId, String postId, String categoryId);

    List<AccessRequest> getPendingRequests();

    List<AccessRequest> getMyRequests(String userId);

    AccessRequest approve(String requestId, @Nullable AccessRequest.GrantScope grantScope);

    AccessRequest reject(String requestId);
}
