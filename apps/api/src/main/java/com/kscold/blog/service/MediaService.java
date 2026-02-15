package com.kscold.blog.service;

import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaService {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${file.max-size:10485760}")
    private long maxFileSize;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "gif", "webp", "svg"
    );

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"
    );

    public String upload(MultipartFile file) {
        validateFile(file);

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String filename = UUID.randomUUID().toString() + "." + extension;

            Path targetPath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            log.info("File uploaded successfully: {}", filename);

            return "/uploads/" + filename;
        } catch (IOException e) {
            log.error("Failed to upload file", e);
            throw new InvalidRequestException(
                    ErrorCode.INVALID_INPUT_VALUE,
                    "파일 업로드에 실패했습니다: " + e.getMessage()
            );
        }
    }

    public void delete(String filePath) {
        try {
            String filename = filePath.replace("/uploads/", "");
            Path path = Paths.get(uploadDir, filename).toAbsolutePath().normalize();

            if (Files.exists(path)) {
                Files.delete(path);
                log.info("File deleted successfully: {}", filename);
            }
        } catch (IOException e) {
            log.error("Failed to delete file: {}", filePath, e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException(
                    ErrorCode.INVALID_INPUT_VALUE,
                    "파일이 비어있습니다"
            );
        }

        if (file.getSize() > maxFileSize) {
            throw new InvalidRequestException(
                    ErrorCode.INVALID_INPUT_VALUE,
                    String.format("파일 크기가 너무 큽니다 (최대 %dMB)", maxFileSize / 1024 / 1024)
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
            throw new InvalidRequestException(
                    ErrorCode.INVALID_INPUT_VALUE,
                    "지원하지 않는 파일 형식입니다. 이미지 파일만 업로드 가능합니다"
            );
        }

        String filename = file.getOriginalFilename();
        String extension = getFileExtension(filename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new InvalidRequestException(
                    ErrorCode.INVALID_INPUT_VALUE,
                    "허용되지 않는 파일 확장자입니다"
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
