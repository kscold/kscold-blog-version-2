package com.kscold.blog.service;

import com.kscold.blog.dto.request.VaultFolderCreateRequest;
import com.kscold.blog.dto.request.VaultFolderUpdateRequest;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.model.VaultFolder;
import com.kscold.blog.repository.VaultFolderRepository;
import com.kscold.blog.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VaultFolderService {

    private final VaultFolderRepository vaultFolderRepository;
    private static final int MAX_DEPTH = 4;

    @Transactional
    public VaultFolder create(VaultFolderCreateRequest request) {
        String slug = request.getSlug() != null ? request.getSlug() : SlugUtils.generate(request.getName());

        VaultFolder folder = VaultFolder.builder()
                .name(request.getName())
                .slug(slug)
                .parent(request.getParent())
                .order(request.getOrder() != null ? request.getOrder() : 0)
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
    public VaultFolder update(String id, VaultFolderUpdateRequest request) {
        VaultFolder folder = getById(id);
        if (request.getName() != null) folder.setName(request.getName());
        if (request.getSlug() != null) folder.setSlug(request.getSlug());
        if (request.getOrder() != null) folder.setOrder(request.getOrder());
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

    @Transactional
    public void incrementNoteCount(String folderId) {
        VaultFolder folder = getById(folderId);
        folder.setNoteCount(folder.getNoteCount() + 1);
        vaultFolderRepository.save(folder);
    }

    @Transactional
    public void decrementNoteCount(String folderId) {
        VaultFolder folder = getById(folderId);
        folder.setNoteCount(Math.max(0, folder.getNoteCount() - 1));
        vaultFolderRepository.save(folder);
    }
}
