package com.kscold.blog.blog.adapter.out.persistence;

import com.mongodb.MongoException;
import com.mongodb.client.MongoCollection;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PostIndexCleanupMigration implements ApplicationRunner {

    static final String COLLECTION = "posts";
    private static final int INDEX_NOT_FOUND_CODE = 27;

    private final MongoTemplate mongoTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            MongoCollection<Document> collection = mongoTemplate.getCollection(COLLECTION);
            Map<String, Document> existingIndexes = readIndexes(collection);
            PostIndexCleanupPolicy.findRemovableIndexes(existingIndexes)
                    .forEach(indexName -> dropLegacyIndex(collection, indexName));
        } catch (MongoException exception) {
            log.warn("포스트 인덱스 정리를 건너뜁니다");
        }
    }

    private Map<String, Document> readIndexes(MongoCollection<Document> collection) {
        Map<String, Document> indexes = new LinkedHashMap<>();
        collection.listIndexes().into(new ArrayList<>()).forEach(index -> addIndex(indexes, index));
        return Collections.unmodifiableMap(indexes);
    }

    private void addIndex(Map<String, Document> indexes, Document index) {
        Object nameValue = index.get("name");
        Object keysValue = index.get("key");
        if (nameValue instanceof String name && keysValue instanceof Document keys) {
            indexes.put(name, new Document(keys));
        }
    }

    private void dropLegacyIndex(MongoCollection<Document> collection, String indexName) {
        try {
            collection.dropIndex(indexName);
            log.info("구형 포스트 인덱스를 제거했습니다: {}", indexName);
        } catch (MongoException exception) {
            if (exception.getCode() != INDEX_NOT_FOUND_CODE) {
                throw exception;
            }
            log.info("구형 포스트 인덱스가 이미 제거됐습니다: {}", indexName);
        }
    }
}
