package com.kscold.blog.media.adapter.out.storage;

import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.media.domain.port.out.FileStoragePort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.net.URI;
import java.util.UUID;

@Slf4j
@Primary
@Component
public class MinioFileStorageAdapter implements FileStoragePort {

    private final S3Client s3Client;

    @Value("${minio.bucket:blog}")
    private String bucket;

    @Value("${minio.public-url:https://bucket.kscold.com}")
    private String publicUrl;

    public MinioFileStorageAdapter(
            @Value("${minio.endpoint:http://localhost:9000}") String endpoint,
            @Value("${minio.access-key:minioadmin}") String accessKey,
            @Value("${minio.secret-key:minioadmin}") String secretKey
    ) {
        this.s3Client = S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.US_EAST_1)
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .forcePathStyle(true)
                .build();
    }

    @Override
    public String store(MultipartFile file) {
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String key = UUID.randomUUID().toString() + (extension.isEmpty() ? "" : "." + extension);

            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(file.getContentType())
                            .contentLength(file.getSize())
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize())
            );

            log.info("File uploaded to MinIO: {}/{}", bucket, key);
            return publicUrl + "/" + bucket + "/" + key;
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
            String prefix = publicUrl + "/" + bucket + "/";
            if (!fileUrl.startsWith(prefix)) {
                log.warn("Unknown file URL format, skipping delete: {}", fileUrl);
                return;
            }
            String key = fileUrl.substring(prefix.length());

            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build());

            log.info("File deleted from MinIO: {}/{}", bucket, key);
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
