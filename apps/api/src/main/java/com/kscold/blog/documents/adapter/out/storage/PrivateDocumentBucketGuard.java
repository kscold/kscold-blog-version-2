package com.kscold.blog.documents.adapter.out.storage;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.media.adapter.out.storage.MinioStorageSupport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.GetBucketPolicyRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Component
public class PrivateDocumentBucketGuard {

    private final S3Client client;
    private final String bucket;

    public PrivateDocumentBucketGuard(
            MinioStorageSupport support,
            @Value("${minio.private-documents-bucket:blog-private-documents}") String bucket) {
        if (bucket == null
                || !bucket.matches("[a-z0-9][a-z0-9\\-]{1,61}[a-z0-9]")
                || bucket.equals(support.getBucket())) {
            throw new IllegalStateException("개인 문서는 공개 블로그와 다른 전용 버킷을 사용해야 합니다.");
        }
        this.client = support.getClient();
        this.bucket = bucket;
    }

    public String getBucket() {
        return bucket;
    }

    public synchronized void ensurePrivateBucket() {
        try {
            ensureBucketExists();
            // 정책이 있으면 내용에 관계없이 중단한다. 개인 문서 버킷은 공개 정책을 가져서는 안 된다.
            client.getBucketPolicy(GetBucketPolicyRequest.builder().bucket(bucket).build());
            throw unavailable();
        } catch (S3Exception exception) {
            if (!isMissingPolicy(exception)) {
                throw unavailable();
            }
        } catch (RuntimeException exception) {
            throw unavailable();
        }
    }

    private void ensureBucketExists() {
        try {
            client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
        } catch (S3Exception exception) {
            if (exception.statusCode() != 404) {
                throw exception;
            }
            try {
                client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
            } catch (S3Exception creationFailure) {
                if (creationFailure.awsErrorDetails() == null
                        || !"BucketAlreadyOwnedByYou"
                                .equals(creationFailure.awsErrorDetails().errorCode())) {
                    throw creationFailure;
                }
            }
        }
    }

    private boolean isMissingPolicy(S3Exception exception) {
        return exception.statusCode() == 404
                && exception.awsErrorDetails() != null
                && "NoSuchBucketPolicy".equals(exception.awsErrorDetails().errorCode());
    }

    private BusinessException unavailable() {
        return new BusinessException(
                ErrorCode.EXTERNAL_API_ERROR, "개인 문서 저장소의 비공개 설정을 확인할 수 없습니다. 관리자에게 문의해주세요.");
    }
}
