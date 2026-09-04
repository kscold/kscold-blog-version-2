package com.kscold.blog.social.adapter.out.persistence;

import com.kscold.blog.shared.security.OneWayIdentifierHasher;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

/** 과거 익명 좋아요에 저장된 IP 기반 원문을 단방향 식별자로 치환한다. */
@Slf4j
@Component
@RequiredArgsConstructor
public class AnonymousLikeIdentifierMigration implements ApplicationRunner {

    private static final String LEGACY_SEPARATOR_PATTERN = "\\|";
    private static final String[] COLLECTIONS = {"feeds", "feed_comments"};

    private final MongoTemplate mongoTemplate;

    @Override
    public void run(ApplicationArguments args) {
        long migrated = 0;
        for (String collection : COLLECTIONS) {
            migrated += migrateCollection(collection);
        }
        if (migrated > 0) {
            log.info("익명 좋아요 식별자 마이그레이션 완료: documents={}", migrated);
        }
    }

    private long migrateCollection(String collection) {
        Query legacyQuery = Query.query(Criteria.where("likedBy").regex(LEGACY_SEPARATOR_PATTERN));
        legacyQuery.fields().include("_id").include("likedBy");
        long migrated = 0;
        for (Document document : mongoTemplate.find(legacyQuery, Document.class, collection)) {
            Set<String> identifiers = normalize(document.get("likedBy"));
            if (identifiers == null) {
                continue;
            }
            mongoTemplate.updateFirst(
                    Query.query(Criteria.where("_id").is(document.get("_id"))),
                    new Update().set("likedBy", identifiers).set("likesCount", identifiers.size()),
                    collection);
            migrated++;
        }
        return migrated;
    }

    private Set<String> normalize(Object value) {
        if (!(value instanceof Collection<?> values)) {
            return null;
        }
        Set<String> normalized = new LinkedHashSet<>();
        boolean changed = false;
        for (Object entry : values) {
            if (!(entry instanceof String identifier)) {
                continue;
            }
            if (identifier.contains("|")) {
                normalized.add(OneWayIdentifierHasher.hash(identifier));
                changed = true;
            } else {
                normalized.add(identifier);
            }
        }
        return changed ? normalized : null;
    }
}
