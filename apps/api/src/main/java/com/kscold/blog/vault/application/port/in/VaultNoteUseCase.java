package com.kscold.blog.vault.application.port.in;

import com.kscold.blog.vault.application.dto.command.NoteCreateCommand;
import com.kscold.blog.vault.application.dto.command.NoteUpdateCommand;
import com.kscold.blog.vault.application.dto.response.GraphDataResponse;
import com.kscold.blog.vault.domain.model.VaultNote;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface VaultNoteUseCase {

    VaultNote create(NoteCreateCommand command, String userId);

    VaultNote update(String id, NoteUpdateCommand command);

    void delete(String id);

    VaultNote getById(String id);

    VaultNote getBySlugWithView(String slug);

    Page<VaultNote> getAll(Pageable pageable);

    Page<VaultNote> getByFolder(String folderId, Pageable pageable);

    List<VaultNote> getBackreferences(String noteId);

    GraphDataResponse getGraphData();

    Page<VaultNote> search(String query, Pageable pageable);

    void incrementCommentCount(String noteId);

    void decrementCommentCount(String noteId);

    int reindexAllLinks();
}
