package com.kscold.blog.vault.application.port.in;

import com.kscold.blog.vault.application.dto.FolderCreateCommand;
import com.kscold.blog.vault.application.dto.FolderUpdateCommand;
import com.kscold.blog.vault.domain.model.VaultFolder;

import java.util.List;

public interface VaultFolderUseCase {

    List<VaultFolder> getAll();

    VaultFolder getById(String id);

    VaultFolder create(FolderCreateCommand command);

    VaultFolder update(String id, FolderUpdateCommand command);

    void delete(String id);

    void incrementNoteCount(String folderId);

    void decrementNoteCount(String folderId);
}
