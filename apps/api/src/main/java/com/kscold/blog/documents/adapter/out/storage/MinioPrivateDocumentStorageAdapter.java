package com.kscold.blog.documents.adapter.out.storage;

import com.kscold.blog.documents.domain.model.PrivateDocumentFile;
import com.kscold.blog.documents.domain.port.out.PrivateDocumentStoragePort;
import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.media.adapter.out.storage.MinioStorageSupport;
import java.io.InputStream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Component
@RequiredArgsConstructor
public class MinioPrivateDocumentStorageAdapter implements PrivateDocumentStoragePort {

    private final MinioStorageSupport support;
    private final PrivateDocumentBucketGuard bucketGuard;

    @Override
    public void upload(String key, PrivateDocumentFile file) {
        bucketGuard.ensurePrivateBucket();
        try {
            support.getClient()
                    .putObject(
                            PutObjectRequest.builder()
                                    .bucket(bucketGuard.getBucket())
                                    .key(key)
                                    .contentType(file.contentType())
                                    .contentLength(file.size())
                                    .build(),
                            RequestBody.fromInputStream(file.inputStream(), file.size()));
        } catch (RuntimeException exception) {
            throw storageFailure();
        }
    }

    @Override
    public InputStream download(String key) {
        bucketGuard.ensurePrivateBucket();
        try {
            return support.getClient()
                    .getObject(
                            GetObjectRequest.builder()
                                    .bucket(bucketGuard.getBucket())
                                    .key(key)
                                    .build());
        } catch (S3Exception exception) {
            if (exception.statusCode() == 404) {
                throw new ResourceNotFoundException(
                        ErrorCode.RESOURCE_NOT_FOUND, "문서 파일을 찾을 수 없습니다.");
            }
            throw storageFailure();
        } catch (RuntimeException exception) {
            throw storageFailure();
        }
    }

    @Override
    public void delete(String key) {
        bucketGuard.ensurePrivateBucket();
        try {
            support.getClient()
                    .deleteObject(
                            DeleteObjectRequest.builder()
                                    .bucket(bucketGuard.getBucket())
                                    .key(key)
                                    .build());
        } catch (RuntimeException exception) {
            throw storageFailure();
        }
    }

    private BusinessException storageFailure() {
        return new BusinessException(
                ErrorCode.EXTERNAL_API_ERROR, "개인 문서 저장소에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
    }
}
