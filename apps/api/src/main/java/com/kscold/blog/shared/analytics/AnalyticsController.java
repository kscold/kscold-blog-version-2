package com.kscold.blog.shared.analytics;

import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.shared.web.ClientIdentifierResolver;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnalyticsController {

    private final PageVisitService pageVisitService;
    private final PageExistenceChecker pageExistenceChecker;
    private final ClientIdentifierResolver clientIdentifierResolver;
    private final UserQueryPort userQueryPort;

    /** 프론트에서 페이지 방문 시 호출 (인증 불필요) - 실존 페이지만 집계 */
    @PostMapping("/analytics/page-visit")
    public ResponseEntity<ApiResponse<Void>> trackPageVisit(
            @RequestBody PageVisitRequest body,
            @AuthenticationPrincipal String userId,
            HttpServletRequest request
    ) {
        String normalized = normalize(body.path());
        if (!pageExistenceChecker.exists(normalized)) {
            return ResponseEntity.ok(ApiResponse.success(null));
        }

        String ip = clientIdentifierResolver.resolve(request);
        String resolvedUserId = resolveUserId(userId);
        String username = resolveUsername(resolvedUserId);
        pageVisitService.record(body.path(), ip, resolvedUserId, username);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /** 어드민: path별 TOP 방문 */
    @GetMapping("/admin/analytics/top-paths")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PageVisitService.PathStat>>> topPaths(
            @RequestParam(defaultValue = "7") int days,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(pageVisitService.topPaths(days, limit)));
    }

    /** 어드민: 일별 방문 추이 */
    @GetMapping("/admin/analytics/daily-visits")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PageVisitService.DailyStat>>> dailyVisits(
            @RequestParam(defaultValue = "30") int days
    ) {
        return ResponseEntity.ok(ApiResponse.success(pageVisitService.dailyVisits(days)));
    }

    /**
     * 어드민: 최근 방문 히스토리.
     * @param path 선택적 경로 필터
     * @param loggedInOnly 로그인 유저만 필터링 (기본 true)
     */
    @GetMapping("/admin/analytics/visit-history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PageVisitService.VisitEntry>>> visitHistory(
            @RequestParam(required = false) String path,
            @RequestParam(defaultValue = "true") boolean loggedInOnly,
            @RequestParam(defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                pageVisitService.recentVisits(path, loggedInOnly, limit)));
    }

    private String resolveUserId(String raw) {
        if (!StringUtils.hasText(raw) || "anonymousUser".equals(raw)) return null;
        return raw;
    }

    private String resolveUsername(String userId) {
        if (userId == null) return null;
        try {
            return userQueryPort.getUserById(userId).displayName();
        } catch (Exception e) {
            return null;
        }
    }

    private String normalize(String path) {
        if (path == null) return "/";
        int q = path.indexOf('?');
        String p = q >= 0 ? path.substring(0, q) : path;
        return p.isEmpty() ? "/" : p;
    }

    public record PageVisitRequest(@NotBlank String path) {}
}
