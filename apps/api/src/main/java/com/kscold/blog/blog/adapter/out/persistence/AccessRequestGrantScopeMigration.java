package com.kscold.blog.blog.adapter.out.persistence;

import com.kscold.blog.blog.domain.model.AccessRequest;
import com.mongodb.client.result.UpdateResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AccessRequestGrantScopeMigration implements ApplicationRunner {

    private static final String COLLECTION_NAME = "access_requests";

    private final MongoTemplate mongoTemplate;

    @Override
    public void run(ApplicationArguments args) {
        UpdateResult postScoped = mongoTemplate.updateMulti(
                new Query(new Criteria().andOperator(
                        Criteria.where("grantScope").is(null),
                        Criteria.where("postId").ne(null),
                        Criteria.where("postId").ne("")
                )),
                new Update().set("grantScope", AccessRequest.GrantScope.POST.name()),
                COLLECTION_NAME
        );

        UpdateResult categoryScoped = mongoTemplate.updateMulti(
                new Query(new Criteria().andOperator(
                        Criteria.where("grantScope").is(null),
                        new Criteria().orOperator(
                                Criteria.where("postId").exists(false),
                                Criteria.where("postId").is(null),
                                Criteria.where("postId").is("")
                        )
                )),
                new Update().set("grantScope", AccessRequest.GrantScope.CATEGORY.name()),
                COLLECTION_NAME
        );

        long postCount = postScoped.getModifiedCount();
        long categoryCount = categoryScoped.getModifiedCount();
        if (postCount > 0 || categoryCount > 0) {
            log.info(
                    "Backfilled legacy access request grantScope records: postScope={}, categoryScope={}",
                    postCount,
                    categoryCount
            );
        }
    }
}
