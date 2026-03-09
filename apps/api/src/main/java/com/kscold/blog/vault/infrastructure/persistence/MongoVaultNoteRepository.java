package com.kscold.blog.vault.infrastructure.persistence;

import com.kscold.blog.vault.domain.model.VaultNote;
import com.kscold.blog.vault.domain.port.out.VaultNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MongoVaultNoteRepository implements VaultNoteRepository {

    private final SpringDataVaultNoteRepository delegate;
    private final MongoTemplate mongoTemplate;

    @Override
    public Optional<VaultNote> findById(String id) {
        return delegate.findById(id);
    }

    @Override
    public Optional<VaultNote> findBySlug(String slug) {
        return delegate.findBySlug(slug);
    }

    @Override
    public boolean existsBySlug(String slug) {
        return delegate.existsBySlug(slug);
    }

    @Override
    public VaultNote save(VaultNote note) {
        return delegate.save(note);
    }

    @Override
    public void delete(VaultNote note) {
        delegate.delete(note);
    }

    @Override
    public Page<VaultNote> findAll(Pageable pageable) {
        return delegate.findAll(pageable);
    }

    @Override
    public Page<VaultNote> findByFolderId(String folderId, Pageable pageable) {
        return delegate.findByFolderId(folderId, pageable);
    }

    @Override
    public Page<VaultNote> searchByText(String query, Pageable pageable) {
        return delegate.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(query, query, pageable);
    }

    @Override
    public List<VaultNote> findByOutgoingLinksContaining(String noteId) {
        return delegate.findByOutgoingLinksContaining(noteId);
    }

    @Override
    public List<VaultNote> findAllForGraph() {
        Query query = new Query();
        query.fields().include("id", "title", "slug", "outgoingLinks", "folderId");
        return mongoTemplate.find(query, VaultNote.class);
    }

    @Override
    public void incrementCommentCount(String noteId) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(noteId)),
                new Update().inc("commentsCount", 1),
                VaultNote.class
        );
    }

    @Override
    public void decrementCommentCount(String noteId) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(noteId).and("commentsCount").gt(0)),
                new Update().inc("commentsCount", -1),
                VaultNote.class
        );
    }
}

interface SpringDataVaultNoteRepository extends MongoRepository<VaultNote, String> {
    Optional<VaultNote> findBySlug(String slug);
    boolean existsBySlug(String slug);
    Page<VaultNote> findByFolderId(String folderId, Pageable pageable);
    Page<VaultNote> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
            String title, String content, Pageable pageable);
    List<VaultNote> findByOutgoingLinksContaining(String noteId);
}
