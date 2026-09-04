package com.kscold.blog.analytics.application.service;

import com.kscold.blog.analytics.application.port.in.PageVisitUseCase;
import com.kscold.blog.analytics.domain.model.DailyStat;
import com.kscold.blog.analytics.domain.model.PageVisitLog;
import com.kscold.blog.analytics.domain.model.PathStat;
import com.kscold.blog.analytics.domain.model.VisitEntry;
import com.kscold.blog.analytics.domain.port.out.PageVisitLogRepository;
import java.time.Instant;
import java.util.List;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class PageVisitService implements PageVisitUseCase {

    private final PageVisitLogRepository pageVisitLogRepository;

    // 실제 서비스 라우트만 허용
    private static final Pattern ALLOWED_PATH =
            Pattern.compile(
                    "^/(?:$"
                            + "|blog(?:/[^/]+(?:/[^/]+)?)?"
                            + "|feed(?:/[^/]+)?"
                            + "|vault(?:/[^/]+)?"
                            + "|info(?:/(?:instructor|pawpong|gole))?"
                            + "|guestbook"
                            + "|admin-night(?:/ai-agent-bloom)?"
                            + "|login(?:/(?:recovery|reset-password))?"
                            + "|privacy"
                            + "|product"
                            + "|profile/[^/]+"
                            + "|tags/[^/]+"
                            + ")$");
    private static final Pattern CONTROL_CHARACTER = Pattern.compile("[\\p{Cntrl}]");

    @Override
    public void record(
            String path,
            @Nullable String clientIdentifier,
            @Nullable String userId,
            @Nullable String username) {
        if (!StringUtils.hasText(path)) return;
        String normalized = normalize(path);
        if (CONTROL_CHARACTER.matcher(normalized).find()
                || !ALLOWED_PATH.matcher(normalized).matches()) {
            log.debug("Rejected page visit");
            return;
        }
        PageVisitLog entry =
                PageVisitLog.builder()
                        .path(normalized)
                        .ipHash(StringUtils.hasText(clientIdentifier) ? clientIdentifier : "anon")
                        .userId(StringUtils.hasText(userId) ? userId : null)
                        .username(StringUtils.hasText(username) ? username : null)
                        .createdAt(Instant.now())
                        .build();
        pageVisitLogRepository.insert(entry);
    }

    /** 최근 방문 히스토리 (path 필터 가능, 로그인 유저만 or 전체) */
    @Override
    public List<VisitEntry> recentVisits(String path, boolean loggedInOnly, int limit) {
        return pageVisitLogRepository.recentVisits(path, loggedInOnly, limit);
    }

    /** 최근 N일 동안 path별 방문수 (내림차순) */
    @Override
    public List<PathStat> topPaths(int days, int limit) {
        return pageVisitLogRepository.topPaths(days, limit);
    }

    /** 최근 N일 일별 방문수 (전체) */
    @Override
    public List<DailyStat> dailyVisits(int days) {
        return pageVisitLogRepository.dailyVisits(days);
    }

    private String normalize(String path) {
        String p = path.trim();
        if (p.length() > 200) p = p.substring(0, 200);
        int q = p.indexOf('?');
        if (q >= 0) p = p.substring(0, q);
        if (p.isEmpty()) p = "/";
        return p;
    }
}
