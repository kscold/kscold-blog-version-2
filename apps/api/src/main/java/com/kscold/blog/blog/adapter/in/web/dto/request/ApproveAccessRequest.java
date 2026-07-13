package com.kscold.blog.blog.adapter.in.web.dto.request;

import com.kscold.blog.blog.domain.model.AccessRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/** 접근 요청 승인 DTO */
@Getter
@Builder
@AllArgsConstructor
public class ApproveAccessRequest {

    private AccessRequest.GrantScope grantScope;
}
