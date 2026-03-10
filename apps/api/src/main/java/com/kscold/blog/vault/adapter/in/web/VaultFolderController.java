package com.kscold.blog.vault.adapter.in.web;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.vault.adapter.in.web.dto.VaultFolderResponse;
import com.kscold.blog.vault.application.dto.FolderCreateCommand;
import com.kscold.blog.vault.application.dto.FolderUpdateCommand;
import com.kscold.blog.vault.application.port.in.VaultFolderUseCase;
import com.kscold.blog.vault.domain.model.VaultFolder;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/vault/folders")
@RequiredArgsConstructor
public class VaultFolderController {

    private final VaultFolderUseCase vaultFolderUseCase;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VaultFolderResponse>>> getAllFolders() {
        List<VaultFolder> folders = vaultFolderUseCase.getAll();
        return ResponseEntity.ok(ApiResponse.success(VaultFolderResponse.buildTree(folders)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VaultFolderResponse>> getFolderById(@PathVariable String id) {
        VaultFolder folder = vaultFolderUseCase.getById(id);
        return ResponseEntity.ok(ApiResponse.success(VaultFolderResponse.from(folder)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VaultFolderResponse>> createFolder(
            @Valid @RequestBody FolderCreateCommand command
    ) {
        VaultFolder folder = vaultFolderUseCase.create(command);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(VaultFolderResponse.from(folder), "폴더가 생성되었습니다"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VaultFolderResponse>> updateFolder(
            @PathVariable String id,
            @Valid @RequestBody FolderUpdateCommand command
    ) {
        VaultFolder folder = vaultFolderUseCase.update(id, command);
        return ResponseEntity.ok(ApiResponse.success(VaultFolderResponse.from(folder), "폴더가 수정되었습니다"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFolder(@PathVariable String id) {
        vaultFolderUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }
}
