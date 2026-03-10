package com.kscold.blog.vault.adapter.out.persistence;

import com.kscold.blog.vault.domain.model.VaultNote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MongoVaultNoteRepository extends MongoRepository<VaultNote, String> {

    Optional<VaultNote> findBySlug(String slug);

    Page<VaultNote> findByFolderId(String folderId, Pageable pageable);

    @Query("{ 'outgoingLinks': ?0 }")
    List<VaultNote> findByOutgoingLinksContaining(String noteId);

    @Query("{ '$text': { '$search': ?0 } }")
    Page<VaultNote> searchByText(String query, Pageable pageable);

    boolean existsBySlug(String slug);
}
