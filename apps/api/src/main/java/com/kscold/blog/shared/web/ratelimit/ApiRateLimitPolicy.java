package com.kscold.blog.shared.web.ratelimit;

import java.util.regex.Pattern;

/**
 * API 요청 제한 규칙 하나.
 *
 * <p>분당 {@code ratePerMinute}개씩 채워지는 토큰 통에서 요청마다 하나씩 꺼낸다. 통 크기는 {@code burst + 1}이라 잠깐 몰린 요청은
 * {@code burst}개까지 바로 받아 준다(예전 Nginx limit_req의 burst·nodelay와 같은 동작). 같은 이름의 규칙은 통 하나를 같이 쓴다.
 *
 * @param name 통을 나누는 이름
 * @param method HTTP 메서드
 * @param path context path(/api)를 뺀 요청 경로 정규식
 * @param ratePerMinute 분당 채워지는 요청 수
 * @param burst 한꺼번에 더 받아 주는 요청 수
 * @param exemptsAdmin 관리자는 이 규칙을 적용하지 않음
 */
public record ApiRateLimitPolicy(
        String name,
        String method,
        Pattern path,
        int ratePerMinute,
        int burst,
        boolean exemptsAdmin) {

    public boolean matches(String requestMethod, String requestPath) {
        return method.equalsIgnoreCase(requestMethod) && path.matcher(requestPath).matches();
    }

    public int capacity() {
        return burst + 1;
    }
}
