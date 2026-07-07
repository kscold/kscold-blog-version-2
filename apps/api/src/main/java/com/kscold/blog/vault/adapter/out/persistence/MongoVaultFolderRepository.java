package com.kscold.blog.vault.adapter.out.persistence;

import com.kscold.blog.vault.domain.model.VaultFolder;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoVaultFolderRepository extends MongoRepository<VaultFolder, String> {

    Optional<VaultFolder> findBySlug(String slug);

    List<VaultFolder> findByParent(String parentId);
}
