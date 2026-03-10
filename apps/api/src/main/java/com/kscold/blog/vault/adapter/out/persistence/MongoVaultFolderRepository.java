package com.kscold.blog.vault.adapter.out.persistence;

import com.kscold.blog.vault.domain.model.VaultFolder;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface MongoVaultFolderRepository extends MongoRepository<VaultFolder, String> {

    Optional<VaultFolder> findBySlug(String slug);

    List<VaultFolder> findByParent(String parentId);
}
