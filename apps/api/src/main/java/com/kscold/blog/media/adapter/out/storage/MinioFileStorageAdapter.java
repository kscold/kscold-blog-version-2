package com.kscold.blog.media.adapter.out.storage;

import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.media.domain.port.out.FileStoragePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.util.UUID;

@Slf4j
@Primary
@Component
@RequiredArgsConstructor
public class MinioFileStorageAdapter implements FileStoragePort {

    private final MinioStorageSupport minioStorageSupport;

    @Override
    public String store(MultipartFile file) {
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String key = UUID.randomUUID().toString() + (extension.isEmpty() ? "" : "." + extension);

            minioStorageSupport.getClient().putObject(
                    PutObjectRequest.builder()
                            .bucket(minioStorageSupport.getBucket())
                            .key(key)
                            .contentType(file.getContentType())
                            .contentLength(file.getSize())
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize())
            );

            log.info("File uploaded to MinIO: {}/{}", minioStorageSupport.getBucket(), key);
            return minioStorageSupport.buildPublicUrl(key);
        } catch (Exception e) {
            log.error("Failed to upload file to MinIO", e);
            throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "파일 업로드에 실패했습니다: " + e.getMessage());
        }
    }

    @Override
    public void delete(String fileUrl) {
        try {
            // URL에서 버킷명 이후 key 추출
            // 예: https://bucket.kscold.com/blog/uuid.jpg → key = uuid.jpg
            String prefix = minioStorageSupport.getPublicUrl() + "/" + minioStorageSupport.getBucket() + "/";
            if (!fileUrl.startsWith(prefix)) {
                log.warn("Unknown file URL format, skipping delete: {}", fileUrl);
                return;
            }
            String key = fileUrl.substring(prefix.length());

            minioStorageSupport.getClient().deleteObject(DeleteObjectRequest.builder()
                    .bucket(minioStorageSupport.getBucket())
                    .key(key)
                    .build());

            log.info("File deleted from MinIO: {}/{}", minioStorageSupport.getBucket(), key);
        } catch (Exception e) {
            log.error("Failed to delete file from MinIO: {}", fileUrl, e);
            throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "파일 삭제에 실패했습니다: " + e.getMessage());
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
}
