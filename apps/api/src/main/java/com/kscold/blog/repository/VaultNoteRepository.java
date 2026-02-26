package com.kscold.blog.repository;

import com.kscold.blog.model.VaultNote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VaultNoteRepository extends MongoRepository<VaultNote, String> {

    Optional<VaultNote> findBySlug(String slug);

    Page<VaultNote> findByFolderId(String folderId, Pageable pageable);

    @Query("{ 'outgoingLinks': ?0 }")
    List<VaultNote> findByOutgoingLinksContaining(String noteId);

    @Query("{ 'tags': ?0 }")
    Page<VaultNote> findByTagsContaining(String tag, Pageable pageable);

    @Query("{ '$text': { '$search': ?0 } }")
    Page<VaultNote> searchByText(String query, Pageable pageable);

    boolean existsBySlug(String slug);
}
