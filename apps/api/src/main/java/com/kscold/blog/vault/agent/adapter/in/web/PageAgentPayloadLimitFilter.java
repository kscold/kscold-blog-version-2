package com.kscold.blog.vault.agent.adapter.in.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.shared.web.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Arrays;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** 청크 전송도 제한하여 JSON 역직렬화 전에 페이지 질문의 메모리 사용을 제한한다. */
@Component
public class PageAgentPayloadLimitFilter extends OncePerRequestFilter {

    private static final int MAX_BODY_BYTES = 96 * 1024;
    private final ObjectMapper mapper;

    public PageAgentPayloadLimitFilter(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !"POST".equals(request.getMethod())
                || !"/vault/agent/page/chat/stream"
                        .equals(
                                request.getServletPath().isEmpty()
                                        ? request.getRequestURI()
                                        : request.getServletPath());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (request.getContentLengthLong() > MAX_BODY_BYTES) {
            reject(response);
            return;
        }
        byte[] bytes = request.getInputStream().readNBytes(MAX_BODY_BYTES + 1);
        try {
            if (bytes.length > MAX_BODY_BYTES) {
                reject(response);
            } else {
                chain.doFilter(new BodyRequest(request, bytes), response);
            }
        } finally {
            Arrays.fill(bytes, (byte) 0);
        }
    }

    private void reject(HttpServletResponse response) throws IOException {
        response.setStatus(413);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Cache-Control", "no-store");
        response.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
        mapper.writeValue(
                response.getWriter(),
                ApiResponse.error(
                        ErrorCode.INVALID_INPUT_VALUE.getCode(), "페이지 질문 자료 용량을 초과했습니다."));
    }

    private static final class BodyRequest extends HttpServletRequestWrapper {
        private final byte[] bytes;

        private BodyRequest(HttpServletRequest request, byte[] bytes) {
            super(request);
            this.bytes = bytes;
        }

        @Override
        public ServletInputStream getInputStream() {
            ByteArrayInputStream input = new ByteArrayInputStream(bytes);
            return new ServletInputStream() {
                @Override
                public boolean isFinished() {
                    return input.available() == 0;
                }

                @Override
                public boolean isReady() {
                    return true;
                }

                @Override
                public void setReadListener(ReadListener listener) {
                    throw new UnsupportedOperationException("비동기 본문 읽기는 지원하지 않습니다.");
                }

                @Override
                public int read() {
                    return input.read();
                }
            };
        }
    }
}
