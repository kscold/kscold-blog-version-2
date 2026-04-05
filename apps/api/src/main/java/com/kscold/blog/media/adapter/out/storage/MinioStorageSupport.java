package com.kscold.blog.media.adapter.out.storage;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.net.URI;

@Getter
@Component
public class MinioStorageSupport {

    private final S3Client client;
    private final String bucket;
    private final String publicUrl;

    public MinioStorageSupport(
            @Value("${minio.endpoint:http://localhost:9000}") String endpoint,
            @Value("${minio.access-key:minioadmin}") String accessKey,
            @Value("${minio.secret-key:minioadmin}") String secretKey,
            @Value("${minio.bucket:blog}") String bucket,
            @Value("${minio.public-url:https://bucket.kscold.com}") String publicUrl,
            @Value("${minio.region:us-east-1}") String region
    ) {
        this.client = S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
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
}
