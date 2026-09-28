package com.kscold.blog.documents.adapter.out.storage;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.media.adapter.out.storage.MinioStorageSupport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.awscore.exception.AwsErrorDetails;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.GetBucketPolicyRequest;
import software.amazon.awssdk.services.s3.model.GetBucketPolicyResponse;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@ExtendWith(MockitoExtension.class)
class PrivateDocumentBucketGuardTest {

    @Mock private MinioStorageSupport support;
    @Mock private S3Client client;

    @BeforeEach
    void setUp() {
        when(support.getBucket()).thenReturn("blog");
    }

    @Test
    void rejectsConfiguredPublicBucket() {
        assertThatThrownBy(() -> new PrivateDocumentBucketGuard(support, "blog"))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void allowsOnlyConfirmedAbsentPolicy() {
        PrivateDocumentBucketGuard guard = guard();
        when(client.getBucketPolicy(any(GetBucketPolicyRequest.class)))
                .thenThrow(s3Failure(404, "NoSuchBucketPolicy"));
        assertThatCode(guard::ensurePrivateBucket).doesNotThrowAnyException();
    }

    @Test
    void createsMissingDedicatedBucketWithoutPublicPolicy() {
        PrivateDocumentBucketGuard guard = guard();
        when(client.headBucket(any(HeadBucketRequest.class)))
                .thenThrow(s3Failure(404, "NoSuchBucket"));
        when(client.getBucketPolicy(any(GetBucketPolicyRequest.class)))
                .thenThrow(s3Failure(404, "NoSuchBucketPolicy"));
        guard.ensurePrivateBucket();
        verify(client).createBucket(any(CreateBucketRequest.class));
    }

    @Test
    void deniesAnyExistingPolicyEvenIfPolicyTextIsEmpty() {
        PrivateDocumentBucketGuard guard = guard();
        when(client.getBucketPolicy(any(GetBucketPolicyRequest.class)))
                .thenReturn(GetBucketPolicyResponse.builder().policy("").build());
        assertThatThrownBy(guard::ensurePrivateBucket).isInstanceOf(BusinessException.class);
    }

    @Test
    void failsClosedWhenPolicyCheckIsForbidden() {
        PrivateDocumentBucketGuard guard = guard();
        when(client.getBucketPolicy(any(GetBucketPolicyRequest.class)))
                .thenThrow(s3Failure(403, "AccessDenied"));
        assertThatThrownBy(guard::ensurePrivateBucket).isInstanceOf(BusinessException.class);
    }

    @Test
    void doesNotTreatMissingBucketAsMissingPolicy() {
        PrivateDocumentBucketGuard guard = guard();
        when(client.getBucketPolicy(any(GetBucketPolicyRequest.class)))
                .thenThrow(s3Failure(404, "NoSuchBucket"));
        assertThatThrownBy(guard::ensurePrivateBucket).isInstanceOf(BusinessException.class);
    }

    @Test
    void wrapsNetworkFailureWithoutLeakingInfrastructureDetails() {
        PrivateDocumentBucketGuard guard = guard();
        when(client.headBucket(any(HeadBucketRequest.class)))
                .thenThrow(SdkClientException.create("내부 연결 상세"));
        assertThatThrownBy(guard::ensurePrivateBucket)
                .isInstanceOf(BusinessException.class)
                .hasMessageNotContaining("내부 연결 상세");
    }

    private PrivateDocumentBucketGuard guard() {
        when(support.getClient()).thenReturn(client);
        return new PrivateDocumentBucketGuard(support, "blog-private-documents");
    }

    private S3Exception s3Failure(int status, String code) {
        S3Exception.Builder builder = S3Exception.builder();
        builder.statusCode(status);
        builder.awsErrorDetails(AwsErrorDetails.builder().errorCode(code).build());
        return (S3Exception) builder.build();
    }
}
