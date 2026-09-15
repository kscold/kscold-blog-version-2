package com.kscold.blog.social.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.social.domain.model.Feed;
import com.mongodb.client.MongoClients;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.data.mongodb.core.MongoTemplate;

/** 운영 DB와 분리된 일회용 MongoDB에서 실제 갱신 파이프라인의 동시성을 검사한다. */
@EnabledIfEnvironmentVariable(
        named = "FEED_LIKE_TEST_MONGO_URI",
        matches = "mongodb://127\\.0\\.0\\.1:27017")
class FeedLikeConcurrencyTest {
    @Test
    void repeatedConcurrentIntentAndLegacyToggleKeepCounterConsistent() throws Exception {
        try (var client = MongoClients.create(System.getenv("FEED_LIKE_TEST_MONGO_URI"))) {
            MongoTemplate template =
                    new MongoTemplate(
                            client,
                            "feed_like_test_" + UUID.randomUUID().toString().replace("-", ""));
            FeedRepositoryAdapter repository = new FeedRepositoryAdapter(null, template);
            Feed feed =
                    template.save(
                            Feed.builder()
                                    .content("좋아요 회귀 검증")
                                    .likedBy(new HashSet<>(List.of("existing")))
                                    .likesCount(99)
                                    .build());
            runConcurrent(() -> repository.setLike(feed.getId(), "viewer", true));
            assertLike(template, feed.getId(), 2, "viewer");
            runConcurrent(() -> repository.setLike(feed.getId(), "viewer", false));
            assertLike(template, feed.getId(), 1, "existing");
            runConcurrent(() -> repository.toggleLike(feed.getId(), "viewer"));
            assertLike(template, feed.getId(), 1, "existing");
            try (var pool = Executors.newFixedThreadPool(8)) {
                for (var future :
                        pool.invokeAll(
                                IntStream.range(0, 20)
                                        .mapToObj(
                                                i ->
                                                        (java.util.concurrent.Callable<Void>)
                                                                () -> {
                                                                    repository.setLike(
                                                                            feed.getId(),
                                                                            "different-" + i,
                                                                            true);
                                                                    return null;
                                                                })
                                        .toList())) future.get();
            }
            assertLike(template, feed.getId(), 21, "existing");
        }
    }

    @Test
    void missingLikedByAndDuplicateUnlikesNeverCreateNegativeCounts() {
        try (var client = MongoClients.create(System.getenv("FEED_LIKE_TEST_MONGO_URI"))) {
            MongoTemplate template =
                    new MongoTemplate(
                            client,
                            "feed_like_test_" + UUID.randomUUID().toString().replace("-", ""));
            FeedRepositoryAdapter repository = new FeedRepositoryAdapter(null, template);
            Feed feed = template.save(Feed.builder().likedBy(null).likesCount(null).build());
            assertThat(
                            repository
                                    .setLike(feed.getId(), "viewer", false)
                                    .orElseThrow()
                                    .getLikesCount())
                    .isZero();
            assertThat(
                            repository
                                    .setLike(feed.getId(), "viewer", false)
                                    .orElseThrow()
                                    .getLikesCount())
                    .isZero();
            assertThat(repository.setLike("000000000000000000000000", "viewer", true)).isEmpty();
        }
    }

    private void runConcurrent(Runnable action) throws Exception {
        try (var pool = Executors.newFixedThreadPool(8)) {
            for (var future :
                    pool.invokeAll(
                            IntStream.range(0, 20)
                                    .mapToObj(
                                            i ->
                                                    (java.util.concurrent.Callable<Void>)
                                                            () -> {
                                                                action.run();
                                                                return null;
                                                            })
                                    .toList())) future.get();
        }
    }

    private void assertLike(MongoTemplate template, String id, int count, String member) {
        Feed feed = template.findById(id, Feed.class);
        assertThat(feed).isNotNull();
        assertThat(feed.getLikesCount()).isEqualTo(count);
        assertThat(feed.getLikedBy()).hasSize(count).contains(member);
    }
}
