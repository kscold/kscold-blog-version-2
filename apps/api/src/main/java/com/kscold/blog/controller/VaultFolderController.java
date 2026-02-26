package com.kscold.blog.controller;

import com.kscold.blog.dto.request.VaultFolderCreateRequest;
import com.kscold.blog.dto.request.VaultFolderUpdateRequest;
import com.kscold.blog.dto.response.ApiResponse;
import com.kscold.blog.dto.response.VaultFolderResponse;
import com.kscold.blog.model.VaultFolder;
import com.kscold.blog.service.VaultFolderService;
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

    private final VaultFolderService vaultFolderService;

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
            @Valid @RequestBody VaultFolderCreateRequest request
    ) {
        VaultFolder folder = vaultFolderService.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(VaultFolderResponse.from(folder), "폴더가 생성되었습니다"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VaultFolderResponse>> updateFolder(
            @PathVariable String id,
            @Valid @RequestBody VaultFolderUpdateRequest request
    ) {
        VaultFolder folder = vaultFolderService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(VaultFolderResponse.from(folder), "폴더가 수정되었습니다"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFolder(@PathVariable String id) {
        vaultFolderService.delete(id);
        return ResponseEntity.ok(ApiResponse.successWithMessage("폴더가 삭제되었습니다"));
    }
}
