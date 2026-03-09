package com.kscold.blog.vault.infrastructure.persistence;

import com.kscold.blog.vault.domain.model.VaultNoteComment;
import com.kscold.blog.vault.domain.port.out.VaultNoteCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MongoVaultNoteCommentRepository implements VaultNoteCommentRepository {

    private final SpringDataVaultNoteCommentRepository delegate;

    @Override
    public Optional<VaultNoteComment> findById(String id) {
        return delegate.findById(id);
    }

    @Override
    public VaultNoteComment save(VaultNoteComment comment) {
        return delegate.save(comment);
    }

    @Override
    public void delete(VaultNoteComment comment) {
        delegate.delete(comment);
    }

    @Override
    public Page<VaultNoteComment> findByNoteId(String noteId, Pageable pageable) {
        return delegate.findByNoteId(noteId, pageable);
    }

    @Override
    public void deleteAllByNoteId(String noteId) {
        delegate.deleteAllByNoteId(noteId);
    }
}

interface SpringDataVaultNoteCommentRepository extends MongoRepository<VaultNoteComment, String> {
    Page<VaultNoteComment> findByNoteId(String noteId, Pageable pageable);
    void deleteAllByNoteId(String noteId);
}
