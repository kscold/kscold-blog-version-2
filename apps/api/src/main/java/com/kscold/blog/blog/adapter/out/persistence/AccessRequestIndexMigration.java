package com.kscold.blog.blog.adapter.out.persistence;

import com.mongodb.client.model.IndexOptions;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AccessRequestIndexMigration implements ApplicationRunner {

    private final MongoTemplate mongoTemplate;

    @Override
    public void run(ApplicationArguments args) {
        var collection = mongoTemplate.getCollection("access_requests");
        List<String> indexNames = new ArrayList<>();
        collection.listIndexes().forEach(index -> indexNames.add(index.getString("name")));

        if (indexNames.contains("user_category_idx")) {
            collection.dropIndex("user_category_idx");
            log.info("Dropped legacy access request index user_category_idx");
        }

        collection.createIndex(
                new Document("userId", 1).append("postId", 1),
                new IndexOptions()
                        .name("user_post_idx")
                        .unique(true)
                        .sparse(true)
        );

        collection.createIndex(
                new Document("userId", 1)
                        .append("categoryId", 1)
                        .append("status", 1)
                        .append("grantScope", 1),
                new IndexOptions().name("user_category_status_scope_idx")
        );

        collection.createIndex(
                new Document("status", 1).append("createdAt", -1),
                new IndexOptions().name("status_createdAt_idx")
        );
    }
}
