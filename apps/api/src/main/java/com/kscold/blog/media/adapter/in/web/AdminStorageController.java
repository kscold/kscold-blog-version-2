package com.kscold.blog.media.adapter.in.web;

import com.kscold.blog.media.application.dto.AdminStorageListing;
import com.kscold.blog.media.application.dto.AdminStorageObjectResource;
import com.kscold.blog.media.application.port.in.AdminStorageUseCase;
import com.kscold.blog.shared.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/admin/storage")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminStorageController {

    private final AdminStorageUseCase adminStorageUseCase;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminStorageListing>> getListing(
            @RequestParam(defaultValue = "") String prefix
    ) {
        return ResponseEntity.ok(ApiResponse.success(adminStorageUseCase.getListing(prefix)));
    }

    @PostMapping("/folders")
    public ResponseEntity<ApiResponse<AdminStorageListing>> createFolder(
            @RequestBody CreateFolderRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminStorageUseCase.createFolder(request.prefix(), request.folderName()),
                        "폴더를 만들었습니다."
                )
        );
    }

    @PostMapping("/files")
    public ResponseEntity<ApiResponse<AdminStorageListing>> uploadFiles(
            @RequestParam(defaultValue = "") String prefix,
            @RequestPart("files") List<MultipartFile> files
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminStorageUseCase.uploadFiles(prefix, files),
                        "파일을 업로드했습니다."
                )
        );
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<AdminStorageListing>> deleteEntry(
            @RequestParam(defaultValue = "") String prefix,
            @RequestParam String key
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminStorageUseCase.deleteEntry(prefix, key),
                        "항목을 삭제했습니다."
                )
        );
    }

    @GetMapping("/object")
    public ResponseEntity<byte[]> getObject(
            @RequestParam String key,
            @RequestParam(defaultValue = "0") int download
    ) {
        AdminStorageObjectResource object = adminStorageUseCase.getObject(key);

        ContentDisposition disposition = (download == 1
                ? ContentDisposition.attachment()
                : ContentDisposition.inline())
                .filename(object.getFileName(), StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, object.getContentType())
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentLength(object.getContentLength())
                .body(object.getBuffer());
    }

    private record CreateFolderRequest(String prefix, String folderName) {}
}
