package com.kscold.blog.vault.application.port.in;

import com.kscold.blog.vault.application.dto.NoteCommentCreateCommand;
import com.kscold.blog.vault.domain.model.VaultNoteComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface VaultNoteCommentUseCase {

    VaultNoteComment create(String noteId, NoteCommentCreateCommand command, String userId);

    Page<VaultNoteComment> getByNoteId(String noteId, Pageable pageable, String currentUserId);

    void delete(String noteId, String commentId, String currentUserId);
}
