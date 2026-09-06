package com.kscold.blog.blog.domain.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.bson.Document;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.core.convert.NoOpDbRefResolver;
import org.springframework.data.mongodb.core.convert.QueryMapper;
import org.springframework.data.mongodb.core.index.IndexDefinition;
import org.springframework.data.mongodb.core.index.MongoPersistentEntityIndexResolver;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;

class PostIndexTest {

    private MongoMappingContext mappingContext;

    @BeforeEach
    void setUp() {
        MongoCustomConversions conversions = MongoCustomConversions.create(adapter -> {});
        mappingContext = new MongoMappingContext();
        mappingContext.setSimpleTypeHolder(conversions.getSimpleTypeHolder());
        mappingContext.setInitialEntitySet(Set.of(Post.class));
        mappingContext.afterPropertiesSet();
    }

    @Test
    void resolvesStablePagingIndexesWithMongoFieldNames() {
        Map<String, Document> expectedIndexes = expectedPagingIndexes();
        Map<String, Document> indexes =
                resolveIndexes().entrySet().stream()
                        .filter(entry -> expectedIndexes.containsKey(entry.getKey()))
                        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        assertThat(indexes).containsExactlyInAnyOrderEntriesOf(expectedIndexes);
    }

    @Test
    void doesNotResolveLegacyPagingIndexes() {
        assertThat(resolveIndexes().keySet())
                .doesNotContain(
                        "idx_status_publishedAt",
                        "idx_status_views",
                        "idx_category_status_publishedAt",
                        "idx_tags_status_publishedAt");
    }

    @Test
    void mapsDomainIdSortToMongoIdField() {
        MongoCustomConversions conversions = MongoCustomConversions.create(adapter -> {});
        MappingMongoConverter converter =
                new MappingMongoConverter(NoOpDbRefResolver.INSTANCE, mappingContext);
        converter.setCustomConversions(conversions);
        converter.afterPropertiesSet();
        QueryMapper mapper = new QueryMapper(converter);

        Document mappedSort =
                mapper.getMappedSort(
                        new Document("publishedAt", -1).append("id", -1),
                        mappingContext.getRequiredPersistentEntity(Post.class));

        assertThat(mappedSort).isEqualTo(new Document("publishedAt", -1).append("_id", -1));
    }

    private String indexName(IndexDefinition index) {
        return index.getIndexOptions().getString("name");
    }

    private Map<String, Document> resolveIndexes() {
        MongoPersistentEntityIndexResolver resolver =
                new MongoPersistentEntityIndexResolver(mappingContext);
        return StreamSupport.stream(resolver.resolveIndexFor(Post.class).spliterator(), false)
                .filter(index -> index.getIndexOptions().containsKey("name"))
                .collect(
                        Collectors.toMap(
                                this::indexName,
                                IndexDefinition::getIndexKeys,
                                (first, second) -> first));
    }

    private Map<String, Document> expectedPagingIndexes() {
        return Map.of(
                "idx_status_publishedAt_id_v2",
                statusIndex("publishedAt"),
                "idx_status_createdAt_id_v2",
                statusIndex("createdAt"),
                "idx_status_updatedAt_id_v2",
                statusIndex("updatedAt"),
                "idx_status_views_id_v2",
                statusIndex("views"),
                "idx_category_status_publishedAt_id_v2",
                nestedIndex("category._id"),
                "idx_tags_status_publishedAt_id_v2",
                nestedIndex("tags._id"),
                "idx_createdAt_id_v2",
                new Document("createdAt", -1).append("_id", -1));
    }

    private Document statusIndex(String sortField) {
        return new Document("status", 1).append(sortField, -1).append("_id", -1);
    }

    private Document nestedIndex(String field) {
        return new Document(field, 1)
                .append("status", 1)
                .append("publishedAt", -1)
                .append("_id", -1);
    }
}
