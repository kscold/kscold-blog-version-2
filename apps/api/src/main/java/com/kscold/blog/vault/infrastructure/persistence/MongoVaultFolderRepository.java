package com.kscold.blog.vault.infrastructure.persistence;

import com.kscold.blog.vault.domain.model.VaultFolder;
import com.kscold.blog.vault.domain.port.out.VaultFolderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MongoVaultFolderRepository implements VaultFolderRepository {

    private final SpringDataVaultFolderRepository delegate;
    private final MongoTemplate mongoTemplate;

    @Override
    public Optional<VaultFolder> findById(String id) {
        return delegate.findById(id);
    }

    @Override
    public Optional<VaultFolder> findBySlug(String slug) {
        return delegate.findBySlug(slug);
    }

    @Override
    public VaultFolder save(VaultFolder folder) {
        return delegate.save(folder);
    }

    @Override
    public void delete(VaultFolder folder) {
        delegate.delete(folder);
    }

    @Override
    public List<VaultFolder> findAll() {
        return delegate.findAll();
    }

    @Override
    public List<VaultFolder> findByParent(String parentId) {
        return delegate.findByParent(parentId);
    }

    @Override
    public void incrementNoteCount(String folderId) {
        if (folderId == null) return;
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(folderId)),
                new Update().inc("noteCount", 1),
                VaultFolder.class
        );
    }

    @Override
    public void decrementNoteCount(String folderId) {
        if (folderId == null) return;
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(folderId).and("noteCount").gt(0)),
                new Update().inc("noteCount", -1),
                VaultFolder.class
        );
    }
}

interface SpringDataVaultFolderRepository extends MongoRepository<VaultFolder, String> {
    Optional<VaultFolder> findBySlug(String slug);
    List<VaultFolder> findByParent(String parent);
}
