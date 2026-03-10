package com.kscold.blog.vault.domain.port.out;

import com.kscold.blog.vault.domain.model.VaultNoteComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface VaultNoteCommentRepository {
    Optional<VaultNoteComment> findById(String id);
    VaultNoteComment save(VaultNoteComment comment);
    void delete(VaultNoteComment comment);
    Page<VaultNoteComment> findByNoteId(String noteId, Pageable pageable);
    void deleteAllByNoteId(String noteId);
}
