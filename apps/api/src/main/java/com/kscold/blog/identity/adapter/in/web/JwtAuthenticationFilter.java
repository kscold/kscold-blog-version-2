package com.kscold.blog.identity.adapter.in.web;

import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.identity.domain.model.TokenIdentity;
import com.kscold.blog.identity.domain.port.out.TokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.RequestAttributeSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final TokenProvider tokenProvider;
    private final UserQueryPort userQueryPort;
    private final SecurityContextRepository securityContextRepository =
            new RequestAttributeSecurityContextRepository();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        String token = resolveToken(request);

        TokenIdentity tokenIdentity =
                token == null ? null : tokenProvider.parseAccessToken(token).orElse(null);
        if (tokenIdentity != null) {
            UserQueryPort.AuthenticationInfo user =
                    userQueryPort.findAuthenticationById(tokenIdentity.userId()).orElse(null);
            if (user != null && user.credentialVersion() == tokenIdentity.credentialVersion()) {
                setAuthentication(user, request, response);
            }
        }

        filterChain.doFilter(request, response);
    }

    private void setAuthentication(
            UserQueryPort.AuthenticationInfo user,
            HttpServletRequest request,
            HttpServletResponse response) {
        String role = user.isAdmin() ? "ADMIN" : "USER";
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        user.id(),
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        // 파일 내려받기 같은 스트리밍 응답은 본문을 보낸 뒤 같은 요청이 필터를 한 번 더 지난다. 이 필터는 그때 다시 돌지 않으므로
        // 인증 결과를 요청에 남겨 두지 않으면, 이미 통과한 요청이 "인증 없음"으로 거절되어 응답이 비정상 종료된다.
        securityContextRepository.saveContext(context, request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("auth-token".equals(cookie.getName())
                        && StringUtils.hasText(cookie.getValue())) {
                    return cookie.getValue();
                }
            }
        }

        return null;
    }
}
