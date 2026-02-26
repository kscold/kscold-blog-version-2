package com.kscold.blog.repository;

import com.kscold.blog.model.VaultFolder;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VaultFolderRepository extends MongoRepository<VaultFolder, String> {

    Optional<VaultFolder> findBySlug(String slug);

    List<VaultFolder> findByParentIsNull();

    List<VaultFolder> findByParent(String parentId);

    List<VaultFolder> findByParentOrderByOrderAsc(String parentId);
}
