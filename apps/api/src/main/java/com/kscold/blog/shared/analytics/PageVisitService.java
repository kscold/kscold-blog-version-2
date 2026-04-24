package com.kscold.blog.shared.analytics;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.regex.Pattern;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.group;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.match;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.sort;
import static org.springframework.data.domain.Sort.Direction.DESC;

@Slf4j
@Service
@RequiredArgsConstructor
public class PageVisitService {

    private final MongoTemplate mongoTemplate;

    // 실제 서비스 라우트만 허용
    private static final Pattern ALLOWED_PATH = Pattern.compile(
            "^/(?:$" +
                    "|blog(?:/.*)?" +
                    "|feed(?:/.*)?" +
                    "|vault(?:/.*)?" +
                    "|info(?:/.*)?" +
                    "|guestbook" +
                    "|admin-night(?:/.*)?" +
                    "|login(?:/.*)?" +
                    "|privacy" +
                    ")$");

    public void record(String path, String clientIp, String userId, String username) {
        if (!StringUtils.hasText(path)) return;
        String normalized = normalize(path);
        if (!ALLOWED_PATH.matcher(normalized).matches()) {
            log.debug("Rejected page visit: {}", normalized);
            return;
        }
        PageVisitLog entry = PageVisitLog.builder()
                .path(normalized)
                .ipHash(hash(clientIp))
                .userId(StringUtils.hasText(userId) ? userId : null)
                .username(StringUtils.hasText(username) ? username : null)
                .createdAt(Instant.now())
                .build();
        mongoTemplate.insert(entry);
    }

    /** 최근 방문 히스토리 (path 필터 가능, 로그인 유저만 or 전체) */
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
    public List<PathStat> topPaths(int days, int limit) {
        Instant after = Instant.now().minus(days, ChronoUnit.DAYS);
        Aggregation agg = Aggregation.newAggregation(
                match(Criteria.where("createdAt").gte(after)),
                group("path").count().as("visits"),
                sort(DESC, "visits"),
                Aggregation.limit(limit)
        );
        AggregationResults<RawPathStat> results = mongoTemplate.aggregate(
                agg, "page_visit_logs", RawPathStat.class);
        return results.getMappedResults().stream()
                .map(r -> new PathStat(r.get_id(), r.getVisits(), countUniqueVisitors(r.get_id(), after)))
                .toList();
    }

    /** 최근 N일 일별 방문수 (전체) */
    public List<DailyStat> dailyVisits(int days) {
        Instant after = Instant.now().minus(days, ChronoUnit.DAYS);
        Aggregation agg = Aggregation.newAggregation(
                match(Criteria.where("createdAt").gte(after)),
                Aggregation.project()
                        .andExpression("{ $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Seoul' } }").as("day"),
                group("day").count().as("visits"),
                sort(org.springframework.data.domain.Sort.Direction.ASC, "_id")
        );
        return mongoTemplate.aggregate(agg, "page_visit_logs", DailyRaw.class)
                .getMappedResults().stream()
                .map(r -> new DailyStat(r.get_id(), r.getVisits()))
                .toList();
    }

    private long countUniqueVisitors(String path, Instant after) {
        Aggregation agg = Aggregation.newAggregation(
                match(Criteria.where("path").is(path).and("createdAt").gte(after)),
                group("ipHash"),
                Aggregation.count().as("uniques")
        );
        AggregationResults<org.bson.Document> out = mongoTemplate.aggregate(
                agg, "page_visit_logs", org.bson.Document.class);
        List<org.bson.Document> list = out.getMappedResults();
        return list.isEmpty() ? 0 : list.get(0).getInteger("uniques", 0);
    }

    private String normalize(String path) {
        String p = path.trim();
        if (p.length() > 200) p = p.substring(0, 200);
        int q = p.indexOf('?');
        if (q >= 0) p = p.substring(0, q);
        if (p.isEmpty()) p = "/";
        return p;
    }

    private String hash(String raw) {
        if (!StringUtils.hasText(raw)) return "anon";
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) sb.append(String.format("%02x", b));
            return sb.substring(0, 32);
        } catch (NoSuchAlgorithmException e) {
            return raw;
        }
    }

    public record PathStat(String path, long visits, long uniqueVisitors) {}
    public record DailyStat(String date, long visits) {}

    public record VisitEntry(String path, String userId, String username, String visitedAt) {
        public static VisitEntry from(PageVisitLog log) {
            return new VisitEntry(
                    log.getPath(),
                    log.getUserId(),
                    log.getUsername(),
                    log.getCreatedAt() != null ? log.getCreatedAt().toString() : ""
            );
        }
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
