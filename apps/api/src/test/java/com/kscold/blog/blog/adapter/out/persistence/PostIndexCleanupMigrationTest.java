package com.kscold.blog.blog.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mongodb.MongoException;
import com.mongodb.client.ListIndexesIterable;
import com.mongodb.client.MongoCollection;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.bson.Document;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;

@ExtendWith(MockitoExtension.class)
class PostIndexCleanupMigrationTest {

    private static final List<String> LEGACY_INDEX_NAMES =
            List.of(
                    "idx_status_publishedAt",
                    "idx_status_views",
                    "idx_category_status_publishedAt",
                    "idx_tags_status_publishedAt");

    @Mock private MongoTemplate mongoTemplate;
    @Mock private MongoCollection<Document> collection;
    @Mock private ListIndexesIterable<Document> indexes;

    private List<Document> listedIndexes;
    private PostIndexCleanupMigration migration;

    @BeforeEach
    void setUp() {
        listedIndexes = new ArrayList<>();
        migration = new PostIndexCleanupMigration(mongoTemplate);
        when(mongoTemplate.getCollection(PostIndexCleanupMigration.COLLECTION))
                .thenReturn(collection);
        when(collection.listIndexes()).thenReturn(indexes);
        when(indexes.into(any())).thenAnswer(invocation -> copyIndexes(invocation.getArgument(0)));
    }

    @Test
    @DisplayName("시나리오: 모든 v2 명세가 준비되면 구형 네 인덱스를 제거한다")
    void dropsLegacyIndexesAfterAllV2SpecsAreReady() {
        listIndexes(allExpectedIndexes());

        migration.run(null);

        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(collection, times(4)).dropIndex(captor.capture());
        assertThat(captor.getAllValues()).containsExactlyElementsOf(LEGACY_INDEX_NAMES);
    }

    @Test
    @DisplayName("시나리오: v2 인덱스가 일부 없으면 구형 인덱스를 제거하지 않는다")
    void keepsLegacyIndexesWhenAnyV2IndexIsMissing() {
        Map<String, Document> specs = allExpectedIndexes();
        specs.remove("idx_createdAt_id_v2");
        listIndexes(specs);

        migration.run(null);

        verify(collection, never()).dropIndex(anyString());
    }

    @Test
    @DisplayName("시나리오: v2 인덱스 키가 다르면 구형 인덱스를 제거하지 않는다")
    void keepsLegacyIndexesWhenV2KeysDiffer() {
        Map<String, Document> specs = allExpectedIndexes();
        specs.put(
                "idx_status_publishedAt_id_v2",
                new Document("publishedAt", -1).append("status", 1).append("_id", -1));
        listIndexes(specs);

        migration.run(null);

        verify(collection, never()).dropIndex(anyString());
    }

    @Test
    @DisplayName("시나리오: 구형 이름이 다른 키로 재사용됐으면 해당 인덱스는 제거하지 않는다")
    void keepsReusedLegacyIndexName() {
        Map<String, Document> specs = allExpectedIndexes();
        specs.put("idx_status_views", new Document("views", -1));
        listIndexes(specs);

        migration.run(null);

        verify(collection, never()).dropIndex("idx_status_views");
        verify(collection).dropIndex("idx_status_publishedAt");
    }

    @Test
    @DisplayName("시나리오: 구형 인덱스가 이미 없으면 삭제를 다시 요청하지 않는다")
    void doesNotDropIndexesAfterCleanupIsComplete() {
        listIndexes(PostIndexCleanupPolicy.requiredIndexSpecs());

        migration.run(null);

        verify(collection, never()).dropIndex(anyString());
    }

    @Test
    @DisplayName("시나리오: 다른 인스턴스가 먼저 제거한 인덱스는 건너뛰고 다음 정리를 계속한다")
    void continuesWhenLegacyIndexWasAlreadyDropped() {
        listIndexes(allExpectedIndexes());
        doThrow(new MongoException(27, "인덱스 없음"))
                .when(collection)
                .dropIndex(LEGACY_INDEX_NAMES.getFirst());

        assertThatCode(() -> migration.run(null)).doesNotThrowAnyException();

        verify(collection).dropIndex(LEGACY_INDEX_NAMES.get(1));
        verify(collection).dropIndex(LEGACY_INDEX_NAMES.get(2));
        verify(collection).dropIndex(LEGACY_INDEX_NAMES.get(3));
    }

    @Test
    @DisplayName("시나리오: 인덱스 정리 오류가 발생해도 앱 시작을 막지 않고 남은 정리를 중단한다")
    void stopsCleanupWithoutFailingStartupWhenDropFails() {
        listIndexes(allExpectedIndexes());
        doThrow(new MongoException(13, "인덱스 삭제 권한 없음"))
                .when(collection)
                .dropIndex(LEGACY_INDEX_NAMES.getFirst());

        assertThatCode(() -> migration.run(null)).doesNotThrowAnyException();

        verify(collection, never()).dropIndex(LEGACY_INDEX_NAMES.get(1));
    }

    @Test
    @DisplayName("시나리오: 인덱스 목록의 이름이나 키 타입이 잘못됐으면 해당 항목을 무시한다")
    void ignoresMalformedIndexMetadata() {
        listedIndexes =
                List.of(
                        new Document("name", 1).append("key", new Document("status", 1)),
                        new Document("name", "잘못된-인덱스").append("key", "키 아님"));

        assertThatCode(() -> migration.run(null)).doesNotThrowAnyException();

        verify(collection, never()).dropIndex(anyString());
    }

    private void listIndexes(Map<String, Document> specs) {
        listedIndexes =
                specs.entrySet().stream()
                        .map(
                                entry ->
                                        new Document("name", entry.getKey())
                                                .append("key", new Document(entry.getValue())))
                        .toList();
    }

    private Map<String, Document> allExpectedIndexes() {
        Map<String, Document> indexes =
                new LinkedHashMap<>(PostIndexCleanupPolicy.requiredIndexSpecs());
        indexes.putAll(PostIndexCleanupPolicy.legacyIndexSpecs());
        return indexes;
    }

    private List<Document> copyIndexes(List<Document> target) {
        target.addAll(listedIndexes);
        return target;
    }
}
