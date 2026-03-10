package com.kscold.blog.vault.adapter.out.persistence;

import com.kscold.blog.vault.domain.model.VaultNoteComment;
import com.kscold.blog.vault.domain.port.out.VaultNoteCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class VaultNoteCommentRepositoryAdapter implements VaultNoteCommentRepository {

    private final MongoVaultNoteCommentRepository mongoRepository;

    @Override
    public VaultNoteComment save(VaultNoteComment comment) {
        return mongoRepository.save(comment);
    }

    @Override
    public Optional<VaultNoteComment> findById(String id) {
        return mongoRepository.findById(id);
    }

    @Override
    public Page<VaultNoteComment> findByNoteId(String noteId, Pageable pageable) {
        return mongoRepository.findByNoteId(noteId, pageable);
    }

    @Override
    public void deleteAllByNoteId(String noteId) {
        mongoRepository.deleteAllByNoteId(noteId);
    }

    @Override
    public void delete(VaultNoteComment comment) {
        mongoRepository.delete(comment);
    }
}
