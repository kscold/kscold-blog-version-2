package com.kscold.blog.vault.domain.port.out;

import com.kscold.blog.vault.domain.model.VaultNoteComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface VaultNoteCommentRepository {
    Optional<VaultNoteComment> findById(String id);
    VaultNoteComment save(VaultNoteComment comment);
    List<VaultNoteComment> saveAll(List<VaultNoteComment> comments);
    void delete(VaultNoteComment comment);
    Page<VaultNoteComment> findByNoteId(String noteId, Pageable pageable);
    List<VaultNoteComment> findAnonymousByNoteIdAndAuthorNames(String noteId, List<String> authorNames);
    void deleteAllByNoteId(String noteId);
}
