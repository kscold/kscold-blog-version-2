package com.kscold.blog.blog.application.port.in;

import com.kscold.blog.blog.domain.model.AccessRequest;

import java.util.List;

public interface AccessRequestUseCase {

    AccessRequest requestAccess(String userId, String categoryId, String message);

    boolean hasAccess(String userId, String categoryId);

    List<AccessRequest> getPendingRequests();

    List<AccessRequest> getMyRequests(String userId);

    AccessRequest approve(String requestId);

    AccessRequest reject(String requestId);
}
