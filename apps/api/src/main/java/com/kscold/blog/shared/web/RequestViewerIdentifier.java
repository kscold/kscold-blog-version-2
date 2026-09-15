package com.kscold.blog.shared.web;

import static com.kscold.blog.shared.security.AuthenticatedPrincipalPolicy.normalize;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/** 요청 범위 프록시를 통해 현재 방문자의 좋아요 식별자를 구한다. */
@Component
@RequiredArgsConstructor
public class RequestViewerIdentifier {
    private final HttpServletRequest request;
    private final ClientIdentifierResolver clientIdentifierResolver;

    public String resolve() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String userId =
                auth != null && auth.getPrincipal() instanceof String principal
                        ? normalize(principal)
                        : null;
        return userId != null ? userId : clientIdentifierResolver.resolve(request);
    }
}
