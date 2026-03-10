package com.kscold.blog.vault.domain.port.out;

import com.kscold.blog.vault.domain.model.VaultFolder;

import java.util.List;
import java.util.Optional;

public interface VaultFolderRepository {
    Optional<VaultFolder> findById(String id);
    Optional<VaultFolder> findBySlug(String slug);
    VaultFolder save(VaultFolder folder);
    void delete(VaultFolder folder);
    List<VaultFolder> findAll();
    List<VaultFolder> findByParent(String parentId);
    void incrementNoteCount(String folderId);
    void decrementNoteCount(String folderId);
}
