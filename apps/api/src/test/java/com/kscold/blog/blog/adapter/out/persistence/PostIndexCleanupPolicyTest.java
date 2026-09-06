package com.kscold.blog.blog.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.blog.domain.model.Post;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.bson.Document;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.core.index.IndexDefinition;
import org.springframework.data.mongodb.core.index.MongoPersistentEntityIndexResolver;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;

class PostIndexCleanupPolicyTest {

    @Test
    @DisplayName("시나리오: 모든 v2 명세가 맞으면 실제 구형 인덱스만 정리 대상으로 고른다")
    void findsMatchingLegacyIndexesAfterV2IndexesAreReady() {
        Map<String, Document> existingIndexes = requiredIndexes();
        existingIndexes.putAll(PostIndexCleanupPolicy.legacyIndexSpecs());
        existingIndexes.remove("idx_status_views");

        List<String> result = PostIndexCleanupPolicy.findRemovableIndexes(existingIndexes);

        assertThat(result)
                .containsExactly(
                        "idx_status_publishedAt",
                        "idx_category_status_publishedAt",
                        "idx_tags_status_publishedAt");
    }

    @Test
    @DisplayName("시나리오: v2 인덱스가 하나라도 없으면 구형 인덱스를 고르지 않는다")
    void keepsLegacyIndexesWhenAnyV2IndexIsMissing() {
        Map<String, Document> existingIndexes = allIndexes();
        existingIndexes.remove("idx_createdAt_id_v2");

        List<String> result = PostIndexCleanupPolicy.findRemovableIndexes(existingIndexes);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("시나리오: v2 인덱스 키 순서가 다르면 구형 인덱스를 고르지 않는다")
    void keepsLegacyIndexesWhenV2KeysDiffer() {
        Map<String, Document> existingIndexes = allIndexes();
        existingIndexes.put(
                "idx_status_publishedAt_id_v2",
                new Document("publishedAt", -1).append("status", 1).append("_id", -1));

        List<String> result = PostIndexCleanupPolicy.findRemovableIndexes(existingIndexes);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("시나리오: 구형 이름이 다른 키로 재사용됐으면 정리 대상으로 고르지 않는다")
    void keepsReusedLegacyIndexName() {
        Map<String, Document> existingIndexes = allIndexes();
        existingIndexes.put("idx_status_views", new Document("views", -1));

        List<String> result = PostIndexCleanupPolicy.findRemovableIndexes(existingIndexes);

        assertThat(result).doesNotContain("idx_status_views");
    }

    @Test
    @DisplayName("시나리오: 정리 게이트 명세는 Post에서 해석한 v2 인덱스와 일치한다")
    void requiredSpecsMatchResolvedV2Indexes() {
        Map<String, Document> resolvedV2Indexes = resolveV2Indexes();

        assertThat(toOrderedSpecs(PostIndexCleanupPolicy.requiredIndexSpecs()))
                .containsExactlyInAnyOrderEntriesOf(toOrderedSpecs(resolvedV2Indexes));
    }

    @Test
    @DisplayName("시나리오: 외부에서 받은 명세를 바꿔도 정리 정책 원본은 변하지 않는다")
    void returnsDefensiveIndexSpecCopies() {
        Map<String, Document> copiedSpecs = PostIndexCleanupPolicy.requiredIndexSpecs();
        copiedSpecs.get("idx_status_publishedAt_id_v2").put("status", -1);

        Map<String, Document> freshSpecs = PostIndexCleanupPolicy.requiredIndexSpecs();

        assertThat(freshSpecs.get("idx_status_publishedAt_id_v2").getInteger("status"))
                .isEqualTo(1);
    }

    @Test
    @DisplayName("시나리오: 구형 중첩 인덱스도 Spring이 저장한 Mongo 식별자 경로를 사용한다")
    void legacyNestedSpecsUseMongoIdFields() {
        Map<String, Document> specs = PostIndexCleanupPolicy.legacyIndexSpecs();

        assertThat(specs)
                .containsEntry(
                        "idx_category_status_publishedAt",
                        new Document("category._id", 1)
                                .append("status", 1)
                                .append("publishedAt", -1))
                .containsEntry(
                        "idx_tags_status_publishedAt",
                        new Document("tags._id", 1).append("status", 1).append("publishedAt", -1));
    }

    private Map<String, Document> requiredIndexes() {
        return new LinkedHashMap<>(PostIndexCleanupPolicy.requiredIndexSpecs());
    }

    private Map<String, Document> allIndexes() {
        Map<String, Document> indexes = requiredIndexes();
        indexes.putAll(PostIndexCleanupPolicy.legacyIndexSpecs());
        return indexes;
    }

    private Map<String, Document> resolveV2Indexes() {
        MongoMappingContext mappingContext = postMappingContext();
        MongoPersistentEntityIndexResolver resolver =
                new MongoPersistentEntityIndexResolver(mappingContext);
        return StreamSupport.stream(resolver.resolveIndexFor(Post.class).spliterator(), false)
                .filter(index -> indexName(index).endsWith("_v2"))
                .collect(Collectors.toMap(this::indexName, IndexDefinition::getIndexKeys));
    }

    private String indexName(IndexDefinition index) {
        return index.getIndexOptions().getString("name");
    }

    private Map<String, List<String>> toOrderedSpecs(Map<String, Document> indexes) {
        return indexes.entrySet().stream()
                .collect(
                        Collectors.toMap(
                                Map.Entry::getKey,
                                entry ->
                                        entry.getValue().entrySet().stream()
                                                .map(key -> key.getKey() + ":" + key.getValue())
                                                .toList()));
    }

    private MongoMappingContext postMappingContext() {
        MongoCustomConversions conversions = MongoCustomConversions.create(adapter -> {});
        MongoMappingContext mappingContext = new MongoMappingContext();
        mappingContext.setSimpleTypeHolder(conversions.getSimpleTypeHolder());
        mappingContext.setInitialEntitySet(Set.of(Post.class));
        mappingContext.afterPropertiesSet();
        return mappingContext;
    }
}
