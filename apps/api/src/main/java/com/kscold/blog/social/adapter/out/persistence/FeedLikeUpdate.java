package com.kscold.blog.social.adapter.out.persistence;

import java.util.List;
import org.bson.Document;
import org.springframework.data.mongodb.core.aggregation.AggregationUpdate;

/** 식별자 집합과 카운터를 한 문서 갱신 안에서 함께 계산한다. */
final class FeedLikeUpdate {
    private FeedLikeUpdate() {}

    static AggregationUpdate create(String identifier, Boolean liked) {
        Document existing = new Document("$ifNull", List.of("$likedBy", List.of()));
        Document member = new Document("$literal", List.of(identifier));
        Document add = new Document("$setUnion", List.of(existing, member));
        Document remove = new Document("$setDifference", List.of(existing, member));
        Object next =
                liked == null
                        ? new Document(
                                "$cond",
                                List.of(
                                        new Document(
                                                "$in",
                                                List.of(
                                                        new Document("$literal", identifier),
                                                        existing)),
                                        remove,
                                        add))
                        : (liked ? add : remove);
        return AggregationUpdate.from(
                List.of(
                        context -> new Document("$set", new Document("likedBy", next)),
                        context ->
                                new Document(
                                        "$set",
                                        new Document(
                                                "likesCount", new Document("$size", "$likedBy")))));
    }
}
