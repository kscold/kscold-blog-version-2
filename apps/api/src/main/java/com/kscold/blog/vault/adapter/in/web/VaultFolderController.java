package com.kscold.blog.vault.adapter.in.web;

import com.kscold.blog.dto.response.ApiResponse;
import com.kscold.blog.dto.response.VaultFolderResponse;
import com.kscold.blog.vault.application.dto.FolderCreateCommand;
import com.kscold.blog.vault.application.dto.FolderUpdateCommand;
import com.kscold.blog.vault.application.service.VaultFolderApplicationService;
import com.kscold.blog.vault.domain.model.VaultFolder;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vault/folders")
@RequiredArgsConstructor
public class VaultFolderController {

    private final VaultFolderApplicationService vaultFolderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VaultFolderResponse>>> getAllFolders() {
        List<VaultFolder> folders = vaultFolderService.getAll();
        List<VaultFolderResponse> response = VaultFolderResponse.buildTree(folders);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VaultFolderResponse>> getFolderById(@PathVariable String id) {
        VaultFolder folder = vaultFolderService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(VaultFolderResponse.from(folder)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VaultFolderResponse>> createFolder(
            @Valid @RequestBody FolderCreateCommand command
    ) {
        VaultFolder folder = vaultFolderService.create(command);
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
        VaultFolder folder = vaultFolderService.update(id, command);
        return ResponseEntity.ok(ApiResponse.success(VaultFolderResponse.from(folder), "폴더가 수정되었습니다"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFolder(@PathVariable String id) {
        vaultFolderService.delete(id);
        return ResponseEntity.ok(ApiResponse.successWithMessage("폴더가 삭제되었습니다"));
    }
}
