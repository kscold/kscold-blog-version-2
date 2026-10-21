package com.kscold.blog.lecture.adapter.in.web;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.kscold.blog.exception.RateLimitExceededException;
import com.kscold.blog.lecture.adapter.in.web.dto.request.LectureFeedbackRequest;
import com.kscold.blog.lecture.adapter.in.web.dto.response.LectureFeedbackResponse;
import com.kscold.blog.lecture.application.port.in.LectureFeedbackUseCase;
import com.kscold.blog.shared.web.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class LectureFeedbackController {
    private final LectureFeedbackUseCase useCase;
    // 같은 교육장 공유망에서도 제출할 수 있도록 여유를 두고 과도한 연속 요청만 제한한다.
    // 주소는 응답 DB에 저장하지 않으며 메모리 제한 기록은 30분 뒤 만료된다.
    private final Cache<String, AtomicInteger> requests =
            Caffeine.newBuilder()
                    .maximumSize(10000)
                    .expireAfterWrite(Duration.ofMinutes(30))
                    .build();

    @PostMapping("/lectures/hansalim/feedback")
    public ResponseEntity<ApiResponse<Void>> submit(
            @Valid @RequestBody LectureFeedbackRequest body, HttpServletRequest request) {
        if (requests.get(request.getRemoteAddr(), key -> new AtomicInteger()).incrementAndGet()
                > 300) {
            throw new RateLimitExceededException("요청이 많습니다. 잠시 후 다시 제출해주세요.");
        }
        useCase.submit(body.toCommand());
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(ApiResponse.successWithMessage("의견을 남겨주셔서 감사합니다."));
    }

    @GetMapping("/admin/lectures/hansalim/feedback")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<LectureFeedbackResponse>>> getRecent() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(
                        ApiResponse.success(
                                useCase.getRecent().stream()
                                        .map(LectureFeedbackResponse::from)
                                        .toList()));
    }
}
