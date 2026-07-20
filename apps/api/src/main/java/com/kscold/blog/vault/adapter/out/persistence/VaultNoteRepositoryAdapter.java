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
    public Page<VaultNote> findAll(Pageable pageable) {
        return mongoRepository.findAll(pageable);
    }

    @Override
    public List<VaultNote> findAll() {
        return mongoRepository.findAll();
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
    public List<VaultNote> findAllForGraph() {
        Query query = new Query();
        query.fields().include("id", "title", "slug", "outgoingLinks", "folderId");
        return mongoTemplate.find(query, VaultNote.class);
    }

    @Override
    public List<NoteContentLength> findAllContentLengths() {
        // $strLenCP 로 DB 에서 길이만 계산해 본문 전송을 피함. content 가 없으면 빈 문자열로 처리.
        AggregationOperation project =
                context ->
                        new Document(
                                "$project",
                                new Document("_id", 1)
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
                                new NoteContentLength(
                                        String.valueOf(doc.get("_id")),
                                        doc.get("contentLength") instanceof Number number
                                                ? number.intValue()
                                                : 0))
                .toList();
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
