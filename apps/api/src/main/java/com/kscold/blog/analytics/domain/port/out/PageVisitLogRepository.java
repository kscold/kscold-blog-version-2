package com.kscold.blog.analytics.domain.port.out;

import com.kscold.blog.analytics.domain.model.DailyStat;
import com.kscold.blog.analytics.domain.model.PageVisitLog;
import com.kscold.blog.analytics.domain.model.PathStat;
import com.kscold.blog.analytics.domain.model.VisitEntry;
import java.util.List;

/** 페이지 방문 로그 영속/집계 포트 */
public interface PageVisitLogRepository {

    /** 페이지 방문 로그 저장 */
    void insert(PageVisitLog log);

    /** 최근 방문 히스토리 (path 필터 가능, 로그인 유저만 or 전체) */
    List<VisitEntry> recentVisits(String path, boolean loggedInOnly, int limit);

    /** 최근 N일 동안 path별 방문수 (내림차순) */
    List<PathStat> topPaths(int days, int limit);

    /** 최근 N일 일별 방문수 (전체) */
    List<DailyStat> dailyVisits(int days);
}
