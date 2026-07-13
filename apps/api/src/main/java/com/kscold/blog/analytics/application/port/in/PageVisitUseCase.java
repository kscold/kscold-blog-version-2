package com.kscold.blog.analytics.application.port.in;

import com.kscold.blog.analytics.domain.model.DailyStat;
import com.kscold.blog.analytics.domain.model.PathStat;
import com.kscold.blog.analytics.domain.model.VisitEntry;
import java.util.List;
import org.springframework.lang.Nullable;

/** 페이지 방문 집계 유스케이스 (방문 기록 + 어드민 조회) */
public interface PageVisitUseCase {

    /** 페이지 방문 기록 (실존 라우트만 집계) */
    void record(
            String path,
            @Nullable String clientIp,
            @Nullable String userId,
            @Nullable String username);

    /** 최근 방문 히스토리 (path 필터 가능, 로그인 유저만 or 전체) */
    List<VisitEntry> recentVisits(String path, boolean loggedInOnly, int limit);

    /** 최근 N일 동안 path별 방문수 (내림차순) */
    List<PathStat> topPaths(int days, int limit);

    /** 최근 N일 일별 방문수 (전체) */
    List<DailyStat> dailyVisits(int days);
}
