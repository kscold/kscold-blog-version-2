package com.kscold.blog.media.adapter.out.storage;

import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
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

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Override
    public String store(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String savedFilename = UUID.randomUUID().toString() + "." + extension;

            Path targetPath = uploadPath.resolve(savedFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            log.info("File stored successfully: {}", savedFilename);

            return "/uploads/" + savedFilename;
        } catch (IOException e) {
            log.error("Failed to store file", e);
            throw new InvalidRequestException(
                    ErrorCode.INVALID_INPUT_VALUE,
                    "파일 업로드에 실패했습니다: " + e.getMessage()
            );
        }
    }

    @Override
    public void delete(String fileUrl) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String filename = fileUrl.replace("/uploads/", "");
        Path path = uploadPath.resolve(filename).normalize();

        if (!path.startsWith(uploadPath)) {
            log.warn("Attempted path traversal attack with fileUrl: {}", fileUrl);
            throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "잘못된 파일 경로입니다");
        }

        try {
            if (Files.exists(path)) {
                Files.delete(path);
                log.info("File deleted successfully: {}", filename);
            }
        } catch (IOException e) {
            log.error("Failed to delete file: {}", fileUrl, e);
            throw new InvalidRequestException(
                    ErrorCode.INVALID_INPUT_VALUE,
                    "파일 삭제에 실패했습니다: " + e.getMessage()
            );
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }
}
