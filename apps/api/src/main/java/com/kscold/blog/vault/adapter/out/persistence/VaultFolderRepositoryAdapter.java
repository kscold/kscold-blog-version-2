package com.kscold.blog.vault.adapter.out.persistence;

import com.kscold.blog.vault.domain.model.VaultFolder;
import com.kscold.blog.vault.domain.port.out.VaultFolderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class VaultFolderRepositoryAdapter implements VaultFolderRepository {

    private final MongoVaultFolderRepository mongoRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public VaultFolder save(VaultFolder folder) {
        return mongoRepository.save(folder);
    }

    @Override
    public Optional<VaultFolder> findById(String id) {
        return mongoRepository.findById(id);
    }

    @Override
    public Optional<VaultFolder> findBySlug(String slug) {
        return mongoRepository.findBySlug(slug);
    }

    @Override
    public List<VaultFolder> findAll() {
        return mongoRepository.findAll();
    }

    @Override
    public List<VaultFolder> findByParent(String parentId) {
        return mongoRepository.findByParent(parentId);
    }

    @Override
    public void delete(VaultFolder folder) {
        mongoRepository.delete(folder);
    }

    @Override
    public void incrementNoteCount(String folderId) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(folderId)),
                new Update().inc("noteCount", 1),
                VaultFolder.class
        );
    }

    @Override
    public void decrementNoteCount(String folderId) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(folderId).and("noteCount").gt(0)),
                new Update().inc("noteCount", -1),
                VaultFolder.class
        );
    }
}
