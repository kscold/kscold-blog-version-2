package com.kscold.blog.vault.adapter.out.persistence;

import com.kscold.blog.vault.domain.model.VaultNote;
import com.kscold.blog.vault.domain.port.out.VaultNoteRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class VaultNoteRepositoryAdapter implements VaultNoteRepository {

    private final MongoVaultNoteRepository mongoRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public VaultNote save(VaultNote note) {
        return mongoRepository.save(note);
    }

    @Override
    public Optional<VaultNote> findById(String id) {
        return mongoRepository.findById(id);
    }

    @Override
    public Optional<VaultNote> findBySlug(String slug) {
        return mongoRepository.findBySlug(slug);
    }

    @Override
    public boolean existsBySlug(String slug) {
        return mongoRepository.existsBySlug(slug);
    }

    @Override
    public Page<VaultNote> findByFolderId(String folderId, Pageable pageable) {
        return mongoRepository.findByFolderId(folderId, pageable);
    }

    @Override
    public List<VaultNote> findByOutgoingLinksContaining(String noteId) {
        return mongoRepository.findByOutgoingLinksContaining(noteId);
    }

    @Override
    public List<BacklinkNote> findBacklinkSummaries(String noteId) {
        AggregationOperation match =
                context -> new Document("$match", new Document("outgoingLinks", noteId));
        AggregationOperation project =
                context ->
                        new Document(
                                "$project",
                                new Document("title", 1)
                                        .append("slug", 1)
                                        .append(
                                                "excerpt",
                                                new Document(
                                                        "$substrCP",
                                                        List.of(
                                                                new Document(
                                                                        "$ifNull",
                                                                        List.of("$content", "")),
                                                                0,
                                                                160))));

        return mongoTemplate
                .aggregate(
                        Aggregation.newAggregation(match, project), "vault_notes", Document.class)
                .getMappedResults()
                .stream()
                .map(
                        doc ->
                                new BacklinkNote(
                                        String.valueOf(doc.get("_id")),
                                        doc.getString("title"),
                                        doc.getString("slug"),
                                        doc.getString("excerpt")))
                .toList();
    }

    @Override
    public Page<VaultNote> findAll(Pageable pageable) {
        return mongoRepository.findAll(pageable);
    }

    @Override
    public List<VaultNote> findAll() {
        return mongoRepository.findAll();
    }

    @Override
    public long count() {
        return mongoRepository.count();
    }

    @Override
    public Page<VaultNote> searchByText(String query, Pageable pageable) {
        return mongoRepository.searchByText(query, pageable);
    }

    @Override
    public void delete(VaultNote note) {
        mongoRepository.delete(note);
    }

    @Override
    public List<GraphNote> findAllForGraph() {
        // 그래프 필드와 본문 길이를 한 번에 계산해 전체 컬렉션을 두 번 조회하지 않는다.
        AggregationOperation project =
                context ->
                        new Document(
                                "$project",
                                new Document("_id", 1)
                                        .append("title", 1)
                                        .append("slug", 1)
                                        .append("outgoingLinks", 1)
                                        .append("folderId", 1)
                                        .append(
                                                "contentLength",
                                                new Document(
                                                        "$strLenCP",
                                                        new Document(
                                                                "$ifNull",
                                                                List.of("$content", "")))));

        return mongoTemplate
                .aggregate(Aggregation.newAggregation(project), "vault_notes", Document.class)
                .getMappedResults()
                .stream()
                .map(
                        doc ->
                                new GraphNote(
                                        String.valueOf(doc.get("_id")),
                                        doc.getString("title"),
                                        doc.getString("slug"),
                                        readStringList(doc, "outgoingLinks"),
                                        doc.getString("folderId"),
                                        doc.get("contentLength") instanceof Number number
                                                ? number.intValue()
                                                : 0))
                .toList();
    }

    @Override
    public List<TitleNote> findAllForTitleIndex() {
        Query query = new Query();
        query.fields().include("title").include("slug");

        return mongoTemplate.find(query, Document.class, "vault_notes").stream()
                .map(doc -> new TitleNote(doc.getString("title"), doc.getString("slug")))
                .toList();
    }

    @Override
    public List<SitemapNote> findAllForSitemap() {
        AggregationOperation project =
                context ->
                        new Document(
                                "$project",
                                new Document("_id", 0)
                                        .append("slug", 1)
                                        .append(
                                                "contentLength",
                                                new Document(
                                                        "$strLenCP",
                                                        new Document(
                                                                "$ifNull",
                                                                List.of("$content", "")))));

        return mongoTemplate
                .aggregate(Aggregation.newAggregation(project), "vault_notes", Document.class)
                .getMappedResults()
                .stream()
                .map(
                        doc ->
                                new SitemapNote(
                                        doc.getString("slug"),
                                        doc.get("contentLength") instanceof Number number
                                                ? number.intValue()
                                                : 0))
                .toList();
    }

    private List<String> readStringList(Document document, String fieldName) {
        Object value = document.get(fieldName);
        if (!(value instanceof List<?> values)) {
            return List.of();
        }

        return values.stream().filter(String.class::isInstance).map(String.class::cast).toList();
    }

    @Override
    public void incrementCommentCount(String noteId) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(noteId)),
                new Update().inc("commentsCount", 1),
                VaultNote.class);
    }

    @Override
    public void decrementCommentCount(String noteId) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(noteId).and("commentsCount").gt(0)),
                new Update().inc("commentsCount", -1),
                VaultNote.class);
    }
}
