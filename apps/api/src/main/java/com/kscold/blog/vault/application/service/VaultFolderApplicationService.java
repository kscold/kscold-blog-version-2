package com.kscold.blog.vault.application.service;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.util.SlugUtils;
import com.kscold.blog.vault.application.dto.FolderCreateCommand;
import com.kscold.blog.vault.application.dto.FolderUpdateCommand;
import com.kscold.blog.vault.domain.model.VaultFolder;
import com.kscold.blog.vault.domain.port.out.VaultFolderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VaultFolderApplicationService {

    private final VaultFolderRepository vaultFolderRepository;
    private final MongoTemplate mongoTemplate;
    private static final int MAX_DEPTH = 4;

    @Transactional
    public VaultFolder create(FolderCreateCommand command) {
        String slug = command.getSlug() != null ? command.getSlug() : SlugUtils.generate(command.getName());

        VaultFolder folder = VaultFolder.builder()
                .name(command.getName())
                .slug(slug)
                .parent(command.getParent())
                .order(command.getOrder() != null ? command.getOrder() : 0)
                .build();

        if (folder.getParent() != null) {
            VaultFolder parent = getById(folder.getParent());
            if (parent.getDepth() >= MAX_DEPTH) {
                throw InvalidRequestException.invalidInput("폴더는 최대 5단계까지만 생성할 수 있습니다");
            }
            List<String> ancestors = new ArrayList<>(parent.getAncestors());
            ancestors.add(parent.getId());
            folder.setAncestors(ancestors);
            folder.setDepth(parent.getDepth() + 1);
        } else {
            folder.setAncestors(new ArrayList<>());
            folder.setDepth(0);
        }

        return vaultFolderRepository.save(folder);
    }

    public List<VaultFolder> getAll() {
        return vaultFolderRepository.findAll();
    }

    public VaultFolder getById(String id) {
        return vaultFolderRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.vaultFolder(id));
    }

    public VaultFolder getBySlug(String slug) {
        return vaultFolderRepository.findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.vaultFolder(slug));
    }

    @Transactional
    public VaultFolder update(String id, FolderUpdateCommand command) {
        VaultFolder folder = getById(id);
        if (command.getName() != null) folder.setName(command.getName());
        if (command.getSlug() != null) folder.setSlug(command.getSlug());
        if (command.getOrder() != null) folder.setOrder(command.getOrder());
        return vaultFolderRepository.save(folder);
    }

    @Transactional
    public void delete(String id) {
        VaultFolder folder = getById(id);
        List<VaultFolder> children = vaultFolderRepository.findByParent(id);
        if (!children.isEmpty()) {
            throw InvalidRequestException.invalidInput("하위 폴더가 있는 폴더는 삭제할 수 없습니다");
        }
        vaultFolderRepository.delete(folder);
    }

    /**
     * 노트 수 원자적 증가
     */
    public void incrementNoteCount(String folderId) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("id").is(folderId)),
                new Update().inc("noteCount", 1),
                VaultFolder.class
        );
    }

    /**
     * 노트 수 원자적 감소 (최소 0)
     */
    public void decrementNoteCount(String folderId) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("id").is(folderId).and("noteCount").gt(0)),
                new Update().inc("noteCount", -1),
                VaultFolder.class
        );
    }
}
