package com.kscold.blog.shared.web;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

/**
 * HTTP 요청에서 비회원 클라이언트 식별자를 추출하는 유틸리티.
 *
 * 좋아요·조회수 중복 방지에 쓰인다. IP만 쓰면 같은 IP(회사·카페·공유망)의
 * 다른 사람이 남의 좋아요를 취소할 수 있으므로, IP + 브라우저(User-Agent)를
 * 조합해 "같은 IP·같은 브라우저"일 때만 동일 식별자가 되도록 한다.
 */
@Component
public class ClientIdentifierResolver {

    public String resolve(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        String ip = (forwarded != null && !forwarded.isBlank())
                ? forwarded.split(",")[0].trim()
                : request.getRemoteAddr();

        String userAgent = request.getHeader("User-Agent");
        String browser = (userAgent != null && !userAgent.isBlank())
                ? Integer.toHexString(userAgent.hashCode())
                : "unknown";

        return ip + "|" + browser;
    }
}
