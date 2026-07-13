package com.kscold.blog.blog.adapter.in.web.dto.response;

import com.kscold.blog.blog.domain.model.AccessRequest;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 접근 요청 응답 DTO */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccessRequestResponse {

    private String id;
    private String userId;
    private String username;
    private String postId;
    private String postTitle;
    private String postSlug;
    private String categoryId;
    private String categoryName;
    private AccessRequest.Status status;
    private AccessRequest.GrantScope grantScope;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** AccessRequest 엔티티를 AccessRequestResponse로 변환 */
    public static AccessRequestResponse from(AccessRequest accessRequest) {
        return AccessRequestResponse.builder()
                .id(accessRequest.getId())
                .userId(accessRequest.getUserId())
                .username(accessRequest.getUsername())
                .postId(accessRequest.getPostId())
                .postTitle(accessRequest.getPostTitle())
                .postSlug(accessRequest.getPostSlug())
                .categoryId(accessRequest.getCategoryId())
                .categoryName(accessRequest.getCategoryName())
                .status(accessRequest.getStatus())
                .grantScope(accessRequest.getGrantScope())
                .message(accessRequest.getMessage())
                .createdAt(accessRequest.getCreatedAt())
                .updatedAt(accessRequest.getUpdatedAt())
                .build();
    }

    /** AccessRequest 리스트를 AccessRequestResponse 리스트로 변환 */
    public static List<AccessRequestResponse> from(List<AccessRequest> accessRequests) {
        return accessRequests.stream().map(AccessRequestResponse::from).toList();
    }
}
