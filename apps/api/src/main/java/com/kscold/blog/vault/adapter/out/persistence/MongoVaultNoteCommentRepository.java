package com.kscold.blog.vault.adapter.out.persistence;

import com.kscold.blog.vault.domain.model.VaultNoteComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoVaultNoteCommentRepository extends MongoRepository<VaultNoteComment, String> {

    Page<VaultNoteComment> findByNoteId(String noteId, Pageable pageable);

    void deleteAllByNoteId(String noteId);
}
