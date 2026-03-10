package com.kscold.blog.vault.domain.port.out;

import com.kscold.blog.vault.domain.model.VaultNote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface VaultNoteRepository {
    Optional<VaultNote> findById(String id);
    Optional<VaultNote> findBySlug(String slug);
    boolean existsBySlug(String slug);
    VaultNote save(VaultNote note);
    void delete(VaultNote note);
    Page<VaultNote> findAll(Pageable pageable);
    List<VaultNote> findAll();
    Page<VaultNote> findByFolderId(String folderId, Pageable pageable);
    Page<VaultNote> searchByText(String query, Pageable pageable);
    List<VaultNote> findByOutgoingLinksContaining(String noteId);
    List<VaultNote> findAllForGraph();
    void incrementCommentCount(String noteId);
    void decrementCommentCount(String noteId);
}
