package com.kscold.blog.media.infrastructure.storage;

import com.kscold.blog.media.domain.port.out.FileStoragePort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Component
public class LocalFileStorageAdapter implements FileStoragePort {

    private final Path uploadPath;

    public LocalFileStorageAdapter(@Value("${file.upload-dir:./uploads}") String uploadDir) {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("업로드 디렉토리를 생성할 수 없습니다: " + uploadDir, e);
        }
    }

    @Override
    public String store(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String savedFilename = UUID.randomUUID() + extension;
        Path targetPath = uploadPath.resolve(savedFilename);

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("파일 저장에 실패했습니다: " + originalFilename, e);
        }

        return "/uploads/" + savedFilename;
    }

    @Override
    public void delete(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/uploads/")) {
            return;
        }

        String filename = fileUrl.substring("/uploads/".length());
        Path filePath = uploadPath.resolve(filename);

        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("파일 삭제 실패: {}", filePath, e);
        }
    }
}
