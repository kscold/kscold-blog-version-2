package com.kscold.blog.identity.adapter.in.web;

import com.kscold.blog.identity.application.dto.response.AuthResponse;

/** HttpOnly 쿠키로 전달한 토큰을 제외하고 브라우저에 공개하는 인증 세션 정보. */
public record AuthSessionResponse(AuthResponse.UserInfo user) {

    public static AuthSessionResponse from(AuthResponse authResponse) {
        return new AuthSessionResponse(authResponse.getUser());
    }
}
