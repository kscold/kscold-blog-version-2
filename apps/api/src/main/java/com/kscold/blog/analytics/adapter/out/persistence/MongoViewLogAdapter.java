package com.kscold.blog.analytics.adapter.out.persistence;

import com.kscold.blog.analytics.domain.model.ViewLog;
import com.kscold.blog.analytics.domain.port.out.ViewLogRepository;
import com.mongodb.DuplicateKeyException;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

/** ViewLogRepository 포트 구현체 — MongoTemplate으로 조회 로그 저장 및 views atomic $inc를 수행한다. */
@Component
@RequiredArgsConstructor
public class MongoViewLogAdapter implements ViewLogRepository {

    private final MongoTemplate mongoTemplate;

    @Override
    public boolean insertViewLogIfUnique(ViewLog viewLog) {
        try {
            mongoTemplate.insert(viewLog);
        } catch (org.springframework.dao.DuplicateKeyException | DuplicateKeyException e) {
            // 이미 1시간 내 조회 → 증가 skip
            return false;
        }
        return true;
    }

    @Override
    public void incrementViews(String collectionName, String entityId) {
        // atomic $inc
        Query query = Query.query(Criteria.where("_id").is(toObjectIdOrRaw(entityId)));
        Update update = new Update().inc("views", 1);
        mongoTemplate.updateFirst(query, update, collectionName);
    }

    private Object toObjectIdOrRaw(String id) {
        try {
            return new ObjectId(id);
        } catch (IllegalArgumentException e) {
            return id;
        }
    }
}
