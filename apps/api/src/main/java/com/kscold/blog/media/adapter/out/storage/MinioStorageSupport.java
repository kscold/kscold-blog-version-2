package com.kscold.blog.media.adapter.out.storage;

import java.net.URI;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Getter
@Component
public class MinioStorageSupport {

    private final S3Client client;
    private final String bucket;
    private final String publicUrl;

    public MinioStorageSupport(
            @Value("${minio.endpoint:http://localhost:9000}") String endpoint,
            @Value("${minio.access-key}") String accessKey,
            @Value("${minio.secret-key}") String secretKey,
            @Value("${minio.bucket:blog}") String bucket,
            @Value("${minio.public-url:https://bucket.kscold.com}") String publicUrl,
            @Value("${minio.region:us-east-1}") String region) {
        String requiredAccessKey = requireCredential(accessKey, "minio.access-key");
        String requiredSecretKey = requireCredential(secretKey, "minio.secret-key");
        this.client =
                S3Client.builder()
                        .endpointOverride(URI.create(endpoint))
                        .region(Region.of(region))
                        .credentialsProvider(
                                StaticCredentialsProvider.create(
                                        AwsBasicCredentials.create(
                                                requiredAccessKey, requiredSecretKey)))
                        .forcePathStyle(true)
                        .build();
        this.bucket = bucket;
        this.publicUrl = trimSlashes(publicUrl);
    }

    public String buildPublicUrl(String key) {
        if (publicUrl == null || publicUrl.isBlank()) {
            return null;
        }
        return publicUrl + "/" + bucket + "/" + key;
    }

    private String trimSlashes(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("^/+", "").replaceAll("/+$", "");
    }

    private static String requireCredential(String value, String propertyName) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(propertyName + " must be configured");
        }
        return value;
    }
}
