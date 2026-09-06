package com.kscold.blog.blog.adapter.out.persistence;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.bson.Document;

final class PostIndexCleanupPolicy {

    private static final Map<String, Document> REQUIRED_INDEXES =
            Map.of(
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

    private static final Map<String, Document> LEGACY_INDEXES =
            Map.of(
                    "idx_status_publishedAt",
                    new Document("status", 1).append("publishedAt", -1),
                    "idx_status_views",
                    new Document("status", 1).append("views", -1),
                    "idx_category_status_publishedAt",
                    legacyNestedIndex("category.id"),
                    "idx_tags_status_publishedAt",
                    legacyNestedIndex("tags.id"));

    private static final List<String> LEGACY_INDEX_ORDER =
            List.of(
                    "idx_status_publishedAt",
                    "idx_status_views",
                    "idx_category_status_publishedAt",
                    "idx_tags_status_publishedAt");

    private PostIndexCleanupPolicy() {}

    static List<String> findRemovableIndexes(Map<String, Document> existingIndexes) {
        boolean isReady =
                REQUIRED_INDEXES.entrySet().stream()
                        .allMatch(
                                entry ->
                                        hasSameKeys(
                                                existingIndexes.get(entry.getKey()),
                                                entry.getValue()));
        if (!isReady) {
            return List.of();
        }
        return LEGACY_INDEX_ORDER.stream()
                .filter(name -> hasSameKeys(existingIndexes.get(name), LEGACY_INDEXES.get(name)))
                .toList();
    }

    static Map<String, Document> requiredIndexSpecs() {
        return copyIndexSpecs(REQUIRED_INDEXES);
    }

    static Map<String, Document> legacyIndexSpecs() {
        return copyIndexSpecs(LEGACY_INDEXES);
    }

    private static boolean hasSameKeys(Document actual, Document expected) {
        return actual != null
                && List.copyOf(actual.entrySet()).equals(List.copyOf(expected.entrySet()));
    }

    private static Map<String, Document> copyIndexSpecs(Map<String, Document> source) {
        Map<String, Document> copy = new LinkedHashMap<>();
        source.forEach((name, keys) -> copy.put(name, new Document(keys)));
        return Collections.unmodifiableMap(copy);
    }

    private static Document statusIndex(String sortField) {
        return new Document("status", 1).append(sortField, -1).append("_id", -1);
    }

    private static Document nestedIndex(String field) {
        return new Document(field, 1)
                .append("status", 1)
                .append("publishedAt", -1)
                .append("_id", -1);
    }

    private static Document legacyNestedIndex(String field) {
        return new Document(field, 1).append("status", 1).append("publishedAt", -1);
    }
}
