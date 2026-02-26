package com.kscold.blog.repository;

import com.kscold.blog.model.VaultNoteComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VaultNoteCommentRepository extends MongoRepository<VaultNoteComment, String> {

    Page<VaultNoteComment> findByNoteId(String noteId, Pageable pageable);

    long countByNoteId(String noteId);

    void deleteAllByNoteId(String noteId);
}
