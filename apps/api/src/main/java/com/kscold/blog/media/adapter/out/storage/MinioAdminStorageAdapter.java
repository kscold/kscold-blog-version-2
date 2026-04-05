package com.kscold.blog.media.adapter.out.storage;

import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.media.application.dto.AdminStorageFolderItem;
import com.kscold.blog.media.application.dto.AdminStorageListing;
import com.kscold.blog.media.application.dto.AdminStorageObjectItem;
import com.kscold.blog.media.application.dto.AdminStorageObjectResource;
import com.kscold.blog.media.domain.port.out.AdminStoragePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectsRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.ObjectIdentifier;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Object;

import java.io.IOException;
import java.text.Collator;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Component
@RequiredArgsConstructor
public class MinioAdminStorageAdapter implements AdminStoragePort {

    private final MinioStorageSupport minioStorageSupport;

    @Override
    public AdminStorageListing list(String prefixInput) {
        String currentPrefix = normalizePrefix(prefixInput);
        Collator collator = Collator.getInstance(Locale.KOREAN);
        ListObjectsV2Response response = minioStorageSupport.getClient().listObjectsV2(
                ListObjectsV2Request.builder()
                        .bucket(minioStorageSupport.getBucket())
                        .prefix(currentPrefix.isBlank() ? null : currentPrefix)
                        .delimiter("/")
                        .maxKeys(300)
                        .build()
        );

        List<AdminStorageFolderItem> folders = response.commonPrefixes().stream()
                .map(commonPrefix -> commonPrefix.prefix())
                .filter(Objects::nonNull)
                .map(prefix -> AdminStorageFolderItem.builder()
                        .key(prefix)
                        .name(prefix.substring(currentPrefix.length()).replaceAll("/$", ""))
                        .build())
                .sorted(Comparator.comparing(AdminStorageFolderItem::getName, collator))
                .toList();

        Map<String, S3Object> objectMetaByKey = response.contents().stream()
                .filter(item -> item.key() != null)
                .collect(java.util.stream.Collectors.toMap(S3Object::key, item -> item));

        List<AdminStorageObjectItem> objects = response.contents().stream()
                .map(S3Object::key)
                .filter(Objects::nonNull)
                .filter(key -> !key.equals(currentPrefix) && !key.endsWith("/"))
                .map(key -> {
                    S3Object meta = objectMetaByKey.get(key);
                    String name = key.substring(currentPrefix.length());
                    Instant lastModified = meta.lastModified();

                    return AdminStorageObjectItem.builder()
                            .name(name)
                            .key(key)
                            .size(meta.size() == null ? 0L : meta.size())
                            .lastModified(lastModified == null ? null : lastModified.toString())
                            .image(isImageName(name))
                            .publicUrl(minioStorageSupport.buildPublicUrl(key))
                            .build();
                })
                .sorted(Comparator.comparing(AdminStorageObjectItem::getName, collator))
                .toList();

        return AdminStorageListing.builder()
                .bucket(minioStorageSupport.getBucket())
                .currentPrefix(currentPrefix)
                .parentPrefix(buildParentPrefix(currentPrefix))
                .folders(folders)
                .objects(objects)
                .build();
    }

    @Override
    public void createFolder(String prefixInput, String folderName) {
        String currentPrefix = normalizePrefix(prefixInput);
        String normalizedName = trimSlashes(folderName == null ? "" : folderName).trim();
        String key = normalizePrefix(currentPrefix + normalizedName);

        minioStorageSupport.getClient().putObject(
                PutObjectRequest.builder()
                        .bucket(minioStorageSupport.getBucket())
                        .key(key)
                        .contentType("application/x-directory")
                        .build(),
                RequestBody.fromBytes(new byte[0])
        );
    }

    @Override
    public void uploadFiles(String prefixInput, List<MultipartFile> files) {
        String currentPrefix = normalizePrefix(prefixInput);

        for (MultipartFile file : files) {
            String fileName = extractFileName(file.getOriginalFilename());
            String key = currentPrefix + fileName;

            try {
                minioStorageSupport.getClient().putObject(
                        PutObjectRequest.builder()
                                .bucket(minioStorageSupport.getBucket())
                                .key(key)
                                .contentType(resolveContentType(file.getContentType(), fileName))
                                .contentLength(file.getSize())
                                .build(),
                        RequestBody.fromInputStream(file.getInputStream(), file.getSize())
                );
            } catch (IOException exception) {
                throw new InvalidRequestException(
                        ErrorCode.INVALID_INPUT_VALUE,
                        "파일 업로드에 실패했습니다: " + fileName
                );
            }
        }
    }

    @Override
    public int deleteEntry(String keyInput) {
        boolean isFolder = keyInput != null && keyInput.trim().replace("\\", "/").endsWith("/");
        String key = isFolder ? normalizePrefix(keyInput) : normalizeObjectKey(keyInput);

        if (isFolder) {
            List<String> keys = listKeysRecursively(key);
            if (keys.isEmpty()) {
                return 0;
            }

            List<ObjectIdentifier> identifiers = keys.stream()
                    .map(item -> ObjectIdentifier.builder().key(item).build())
                    .toList();

            minioStorageSupport.getClient().deleteObjects(
                    DeleteObjectsRequest.builder()
                            .bucket(minioStorageSupport.getBucket())
                            .delete(builder -> builder.objects(identifiers))
                            .build()
            );

            return identifiers.size();
        }

        minioStorageSupport.getClient().deleteObject(
                DeleteObjectRequest.builder()
                        .bucket(minioStorageSupport.getBucket())
                        .key(key)
                        .build()
        );
        return 1;
    }

    @Override
    public AdminStorageObjectResource getObject(String keyInput) {
        String key = normalizeObjectKey(keyInput);

        try (ResponseInputStream<GetObjectResponse> stream = minioStorageSupport.getClient().getObject(
                GetObjectRequest.builder()
                        .bucket(minioStorageSupport.getBucket())
                        .key(key)
                        .build()
        )) {
            byte[] buffer = stream.readAllBytes();
            GetObjectResponse response = stream.response();

            return AdminStorageObjectResource.builder()
                    .fileName(extractLeafName(key))
                    .contentType(response.contentType() == null ? inferContentType(key) : response.contentType())
                    .contentLength(response.contentLength() == null ? buffer.length : response.contentLength())
                    .buffer(buffer)
                    .build();
        } catch (IOException exception) {
            throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "파일을 불러오지 못했습니다.");
        }
    }

    private List<String> listKeysRecursively(String prefix) {
        List<String> keys = new ArrayList<>();
        String continuationToken = null;

        do {
            ListObjectsV2Response response = minioStorageSupport.getClient().listObjectsV2(
                    ListObjectsV2Request.builder()
                            .bucket(minioStorageSupport.getBucket())
                            .prefix(prefix)
                            .continuationToken(continuationToken)
                            .build()
            );

            response.contents().stream()
                    .map(S3Object::key)
                    .filter(Objects::nonNull)
                    .forEach(keys::add);

            continuationToken = response.isTruncated() ? response.nextContinuationToken() : null;
        } while (continuationToken != null);

        return keys;
    }

    private String buildParentPrefix(String prefix) {
        if (prefix == null || prefix.isBlank()) {
            return null;
        }

        String normalized = prefix.replaceAll("/$", "");
        int lastSlashIndex = normalized.lastIndexOf('/');
        if (lastSlashIndex < 0) {
            return "";
        }

        return normalized.substring(0, lastSlashIndex + 1);
    }

    private String normalizePrefix(String value) {
        String normalized = normalizePath(value, true);
        return normalized.isBlank() ? "" : normalized + "/";
    }

    private String normalizeObjectKey(String value) {
        String normalized = normalizePath(value, false);
        if (normalized.isBlank()) {
            throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "파일 경로를 확인해주세요.");
        }
        return normalized;
    }

    private String normalizePath(String value, boolean allowTrailingSlash) {
        String raw = value == null ? "" : value.trim().replace("\\", "/");
        if (raw.isBlank()) {
            return "";
        }

        String[] segments = raw.replaceAll("^/+", "").split("/");
        List<String> normalizedSegments = new ArrayList<>();
        for (String segment : segments) {
            if (segment == null || segment.isBlank() || ".".equals(segment)) {
                continue;
            }

            if ("..".equals(segment)) {
                throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "잘못된 경로입니다.");
            }

            normalizedSegments.add(segment);
        }

        String normalized = String.join("/", normalizedSegments);
        if (allowTrailingSlash && value != null && value.endsWith("/") && !normalized.isBlank()) {
            return normalized;
        }
        return normalized;
    }

    private String trimSlashes(String value) {
        return value.replaceAll("^/+", "").replaceAll("/+$", "");
    }

    private String extractFileName(String originalFilename) {
        String normalized = trimSlashes((originalFilename == null ? "" : originalFilename.trim()).replace("\\", "/"));
        int lastSlashIndex = normalized.lastIndexOf('/');
        String fileName = lastSlashIndex >= 0 ? normalized.substring(lastSlashIndex + 1) : normalized;

        if (fileName.isBlank()) {
            throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "파일 이름을 확인해주세요.");
        }

        return fileName;
    }

    private String extractLeafName(String key) {
        int lastSlashIndex = key.lastIndexOf('/');
        return lastSlashIndex >= 0 ? key.substring(lastSlashIndex + 1) : key;
    }

    private String resolveContentType(String contentType, String fileName) {
        if (contentType != null && !contentType.isBlank()) {
            return contentType;
        }
        return inferContentType(fileName);
    }

    private boolean isImageName(String name) {
        String lowerCase = name.toLowerCase(Locale.ROOT);
        return lowerCase.endsWith(".png")
                || lowerCase.endsWith(".jpg")
                || lowerCase.endsWith(".jpeg")
                || lowerCase.endsWith(".gif")
                || lowerCase.endsWith(".webp")
                || lowerCase.endsWith(".svg");
    }

    private String inferContentType(String name) {
        String lowerCase = name.toLowerCase(Locale.ROOT);
        if (lowerCase.endsWith(".png")) return "image/png";
        if (lowerCase.endsWith(".jpg") || lowerCase.endsWith(".jpeg")) return "image/jpeg";
        if (lowerCase.endsWith(".gif")) return "image/gif";
        if (lowerCase.endsWith(".webp")) return "image/webp";
        if (lowerCase.endsWith(".svg")) return "image/svg+xml";
        if (lowerCase.endsWith(".json")) return "application/json; charset=utf-8";
        if (lowerCase.endsWith(".txt")) return "text/plain; charset=utf-8";
        if (lowerCase.endsWith(".md")) return "text/markdown; charset=utf-8";
        if (lowerCase.endsWith(".html")) return "text/html; charset=utf-8";
        if (lowerCase.endsWith(".css")) return "text/css; charset=utf-8";
        if (lowerCase.endsWith(".js")) return "application/javascript; charset=utf-8";
        return "application/octet-stream";
    }
}
