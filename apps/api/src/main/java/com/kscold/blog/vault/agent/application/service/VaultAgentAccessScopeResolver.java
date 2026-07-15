package com.kscold.blog.vault.agent.application.service;

import com.kscold.blog.blog.application.port.in.AccessRequestUseCase;
import com.kscold.blog.blog.domain.model.AccessRequest;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.vault.agent.domain.model.AgentContentAccessScope;
import java.util.LinkedHashSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class VaultAgentAccessScopeResolver {

    private final AccessRequestUseCase accessRequestUseCase;
    private final UserQueryPort userQueryPort;

    public AgentContentAccessScope resolve(@Nullable String userId) {
        if (!StringUtils.hasText(userId)) {
            return AgentContentAccessScope.publicOnly();
        }

        try {
            if (userQueryPort.getUserById(userId).isAdmin()) {
                return AgentContentAccessScope.fullAccess();
            }

            Set<String> postIds = new LinkedHashSet<>();
            Set<String> categoryIds = new LinkedHashSet<>();
            for (AccessRequest request : accessRequestUseCase.getMyRequests(userId)) {
                if (request.getStatus() != AccessRequest.Status.APPROVED) {
                    continue;
                }
                if (request.getGrantScope() == AccessRequest.GrantScope.POST
                        && StringUtils.hasText(request.getPostId())) {
                    postIds.add(request.getPostId());
                }
                if (request.getGrantScope() == AccessRequest.GrantScope.CATEGORY
                        && StringUtils.hasText(request.getCategoryId())) {
                    categoryIds.add(request.getCategoryId());
                }
            }
            return new AgentContentAccessScope(false, postIds, categoryIds);
        } catch (Exception exception) {
            log.warn("Vault Agent 권한 범위 조회에 실패해 공개 콘텐츠만 사용합니다. userId={}", userId);
            return AgentContentAccessScope.publicOnly();
        }
    }
}
