package com.kscold.blog.analytics.adapter.out.persistence;

import static org.springframework.data.domain.Sort.Direction.DESC;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.group;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.match;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.sort;

import com.kscold.blog.analytics.domain.model.DailyStat;
import com.kscold.blog.analytics.domain.model.PageVisitLog;
import com.kscold.blog.analytics.domain.model.PathStat;
import com.kscold.blog.analytics.domain.model.VisitEntry;
import com.kscold.blog.analytics.domain.port.out.PageVisitLogRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/** PageVisitLogRepository 포트 구현체 — MongoTemplate으로 page_visit_logs 집계/저장을 수행함. */
@Component
@RequiredArgsConstructor
public class MongoPageVisitLogAdapter implements PageVisitLogRepository {

    private final MongoTemplate mongoTemplate;

    @Override
    public void insert(PageVisitLog log) {
        mongoTemplate.insert(log);
    }

    /** 최근 방문 히스토리 (path 필터 가능, 로그인 유저만 or 전체) */
    @Override
    public List<VisitEntry> recentVisits(String path, boolean loggedInOnly, int limit) {
        Criteria criteria = new Criteria();
        if (StringUtils.hasText(path)) criteria = criteria.and("path").is(path);
        if (loggedInOnly) criteria = criteria.and("userId").ne(null);

        org.springframework.data.mongodb.core.query.Query query =
                new org.springframework.data.mongodb.core.query.Query(criteria)
                        .with(org.springframework.data.domain.Sort.by(DESC, "createdAt"))
                        .limit(Math.min(Math.max(limit, 1), 200));

        return mongoTemplate.find(query, PageVisitLog.class).stream()
                .map(VisitEntry::from)
                .toList();
    }

    /** 최근 N일 동안 path별 방문수 (내림차순) */
    @Override
    public List<PathStat> topPaths(int days, int limit) {
        Instant after = Instant.now().minus(days, ChronoUnit.DAYS);
        Aggregation agg =
                Aggregation.newAggregation(
                        match(Criteria.where("createdAt").gte(after)),
                        group("path").count().as("visits"),
                        sort(DESC, "visits"),
                        Aggregation.limit(limit));
        AggregationResults<RawPathStat> results =
                mongoTemplate.aggregate(agg, "page_visit_logs", RawPathStat.class);
        return results.getMappedResults().stream()
                .map(
                        r ->
                                new PathStat(
                                        r.get_id(),
                                        r.getVisits(),
                                        countUniqueVisitors(r.get_id(), after)))
                .toList();
    }

    /** 최근 N일 일별 방문수 (전체) */
    @Override
    public List<DailyStat> dailyVisits(int days) {
        Instant after = Instant.now().minus(days, ChronoUnit.DAYS);
        Aggregation agg =
                Aggregation.newAggregation(
                        match(Criteria.where("createdAt").gte(after)),
                        Aggregation.project()
                                .andExpression(
                                        "{ $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Seoul' } }")
                                .as("day"),
                        group("day").count().as("visits"),
                        sort(org.springframework.data.domain.Sort.Direction.ASC, "_id"));
        return mongoTemplate
                .aggregate(agg, "page_visit_logs", DailyRaw.class)
                .getMappedResults()
                .stream()
                .map(r -> new DailyStat(r.get_id(), r.getVisits()))
                .toList();
    }

    private long countUniqueVisitors(String path, Instant after) {
        Aggregation agg =
                Aggregation.newAggregation(
                        match(Criteria.where("path").is(path).and("createdAt").gte(after)),
                        group("ipHash"),
                        Aggregation.count().as("uniques"));
        AggregationResults<org.bson.Document> out =
                mongoTemplate.aggregate(agg, "page_visit_logs", org.bson.Document.class);
        List<org.bson.Document> list = out.getMappedResults();
        return list.isEmpty() ? 0 : list.get(0).getInteger("uniques", 0);
    }

    @lombok.Getter
    @lombok.Setter
    public static class RawPathStat {
        private String _id;
        private long visits;
    }

    @lombok.Getter
    @lombok.Setter
    public static class DailyRaw {
        private String _id;
        private long visits;
    }
}
