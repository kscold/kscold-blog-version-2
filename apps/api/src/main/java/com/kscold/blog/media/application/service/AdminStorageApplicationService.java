package com.kscold.blog.media.application.service;

import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.media.application.dto.AdminStorageListing;
import com.kscold.blog.media.application.dto.AdminStorageObjectResource;
import com.kscold.blog.media.application.port.in.AdminStorageUseCase;
import com.kscold.blog.media.domain.port.out.AdminStoragePort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminStorageApplicationService implements AdminStorageUseCase {

    private final AdminStoragePort adminStoragePort;

    @Override
    public AdminStorageListing getListing(String prefix) {
        return adminStoragePort.list(prefix);
    }

    @Override
    public AdminStorageListing createFolder(String prefix, String folderName) {
        if (folderName == null || folderName.trim().isEmpty()) {
            throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "폴더 이름을 입력해주세요.");
        }

        adminStoragePort.createFolder(prefix, folderName);
        return adminStoragePort.list(prefix);
    }

    @Override
    public AdminStorageListing uploadFiles(String prefix, List<MultipartFile> files) {
        List<MultipartFile> validFiles = files == null
                ? List.of()
                : files.stream().filter(file -> file != null && !file.isEmpty()).toList();

        if (validFiles.isEmpty()) {
            throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "업로드할 파일을 선택해주세요.");
        }

        adminStoragePort.uploadFiles(prefix, validFiles);
        return adminStoragePort.list(prefix);
    }

    @Override
    public AdminStorageListing deleteEntry(String prefix, String key) {
        if (key == null || key.trim().isEmpty()) {
            throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "삭제할 경로를 선택해주세요.");
        }

        int deletedKeys = adminStoragePort.deleteEntry(key);
        return adminStoragePort.list(prefix).toBuilder()
                .deletedKeys(deletedKeys)
                .build();
    }

    @Override
    public AdminStorageObjectResource getObject(String key) {
        if (key == null || key.trim().isEmpty()) {
            throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "파일 경로를 확인해주세요.");
        }

        return adminStoragePort.getObject(key);
    }
}
