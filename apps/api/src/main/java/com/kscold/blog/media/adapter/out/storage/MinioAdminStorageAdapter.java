package com.kscold.blog.media.adapter.out.storage;

import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.media.domain.model.AdminStorageFolderItem;
import com.kscold.blog.media.domain.model.AdminStorageListing;
import com.kscold.blog.media.domain.model.AdminStorageObjectItem;
import com.kscold.blog.media.domain.model.AdminStorageObjectResource;
import com.kscold.blog.media.domain.port.out.AdminStoragePort;
import java.io.IOException;
import java.text.Collator;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
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

@Component
@RequiredArgsConstructor
public class MinioAdminStorageAdapter implements AdminStoragePort {

    private final MinioStorageSupport minioStorageSupport;

    @Override
    public AdminStorageListing list(String prefixInput) {
        String currentPrefix = AdminStoragePathPolicy.normalizePrefix(prefixInput);
        Collator collator = Collator.getInstance(Locale.KOREAN);
        ListObjectsV2Response response =
                minioStorageSupport
                        .getClient()
                        .listObjectsV2(
                                ListObjectsV2Request.builder()
                                        .bucket(minioStorageSupport.getBucket())
                                        .prefix(currentPrefix.isBlank() ? null : currentPrefix)
                                        .delimiter("/")
                                        .maxKeys(300)
                                        .build());

        List<AdminStorageFolderItem> folders =
                response.commonPrefixes().stream()
                        .map(commonPrefix -> commonPrefix.prefix())
                        .filter(Objects::nonNull)
                        .map(
                                prefix ->
                                        AdminStorageFolderItem.builder()
                                                .key(prefix)
                                                .name(
                                                        prefix.substring(currentPrefix.length())
                                                                .replaceAll("/$", ""))
                                                .build())
                        .sorted(Comparator.comparing(AdminStorageFolderItem::getName, collator))
                        .toList();

        Map<String, S3Object> objectMetaByKey =
                response.contents().stream()
                        .filter(item -> item.key() != null)
                        .collect(java.util.stream.Collectors.toMap(S3Object::key, item -> item));

        List<AdminStorageObjectItem> objects =
                response.contents().stream()
                        .map(S3Object::key)
                        .filter(Objects::nonNull)
                        .filter(key -> !key.equals(currentPrefix) && !key.endsWith("/"))
                        .map(
                                key -> {
                                    S3Object meta = objectMetaByKey.get(key);
                                    String name = key.substring(currentPrefix.length());
                                    Instant lastModified = meta.lastModified();

                                    return AdminStorageObjectItem.builder()
                                            .name(name)
                                            .key(key)
                                            .size(meta.size() == null ? 0L : meta.size())
                                            .lastModified(
                                                    lastModified == null
                                                            ? null
                                                            : lastModified.toString())
                                            .image(AdminStorageContentTypeResolver.isImage(name))
                                            .publicUrl(minioStorageSupport.buildPublicUrl(key))
                                            .build();
                                })
                        .sorted(Comparator.comparing(AdminStorageObjectItem::getName, collator))
                        .toList();

        return AdminStorageListing.builder()
                .bucket(minioStorageSupport.getBucket())
                .currentPrefix(currentPrefix)
                .parentPrefix(AdminStoragePathPolicy.buildParentPrefix(currentPrefix))
                .folders(folders)
                .objects(objects)
                .build();
    }

    @Override
    public void createFolder(String prefixInput, String folderName) {
        String currentPrefix = AdminStoragePathPolicy.normalizePrefix(prefixInput);
        String normalizedName =
                AdminStoragePathPolicy.trimSlashes(folderName == null ? "" : folderName).trim();
        String key = AdminStoragePathPolicy.normalizePrefix(currentPrefix + normalizedName);

        minioStorageSupport
                .getClient()
                .putObject(
                        PutObjectRequest.builder()
                                .bucket(minioStorageSupport.getBucket())
                                .key(key)
                                .contentType("application/x-directory")
                                .build(),
                        RequestBody.fromBytes(new byte[0]));
    }

    @Override
    public void uploadFiles(String prefixInput, List<MultipartFile> files) {
        String currentPrefix = AdminStoragePathPolicy.normalizePrefix(prefixInput);

        for (MultipartFile file : files) {
            String fileName = AdminStoragePathPolicy.extractFileName(file.getOriginalFilename());
            String key = currentPrefix + fileName;

            try {
                minioStorageSupport
                        .getClient()
                        .putObject(
                                PutObjectRequest.builder()
                                        .bucket(minioStorageSupport.getBucket())
                                        .key(key)
                                        .contentType(
                                                AdminStorageContentTypeResolver.resolve(
                                                        file.getContentType(), fileName))
                                        .contentLength(file.getSize())
                                        .build(),
                                RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            } catch (IOException exception) {
                throw new InvalidRequestException(
                        ErrorCode.INVALID_INPUT_VALUE, "파일 업로드에 실패했습니다: " + fileName);
            }
        }
    }

    @Override
    public int deleteEntry(String keyInput) {
        boolean isFolder = keyInput != null && keyInput.trim().replace("\\", "/").endsWith("/");
        String key =
                isFolder
                        ? AdminStoragePathPolicy.normalizePrefix(keyInput)
                        : AdminStoragePathPolicy.normalizeObjectKey(keyInput);

        if (isFolder) {
            List<String> keys = listKeysRecursively(key);
            if (keys.isEmpty()) {
                return 0;
            }

            List<ObjectIdentifier> identifiers =
                    keys.stream()
                            .map(item -> ObjectIdentifier.builder().key(item).build())
                            .toList();

            minioStorageSupport
                    .getClient()
                    .deleteObjects(
                            DeleteObjectsRequest.builder()
                                    .bucket(minioStorageSupport.getBucket())
                                    .delete(builder -> builder.objects(identifiers))
                                    .build());

            return identifiers.size();
        }

        minioStorageSupport
                .getClient()
                .deleteObject(
                        DeleteObjectRequest.builder()
                                .bucket(minioStorageSupport.getBucket())
                                .key(key)
                                .build());
        return 1;
    }

    @Override
    public AdminStorageObjectResource getObject(String keyInput) {
        String key = AdminStoragePathPolicy.normalizeObjectKey(keyInput);

        ResponseInputStream<GetObjectResponse> stream =
                minioStorageSupport
                        .getClient()
                        .getObject(
                                GetObjectRequest.builder()
                                        .bucket(minioStorageSupport.getBucket())
                                        .key(key)
                                        .build());
        GetObjectResponse response = stream.response();

        return AdminStorageObjectResource.builder()
                .fileName(AdminStoragePathPolicy.extractLeafName(key))
                .contentType(
                        response.contentType() == null
                                ? AdminStorageContentTypeResolver.infer(key)
                                : response.contentType())
                .contentLength(response.contentLength() == null ? -1L : response.contentLength())
                .inputStream(stream)
                .build();
    }

    private List<String> listKeysRecursively(String prefix) {
        List<String> keys = new ArrayList<>();
        String continuationToken = null;

        do {
            ListObjectsV2Response response =
                    minioStorageSupport
                            .getClient()
                            .listObjectsV2(
                                    ListObjectsV2Request.builder()
                                            .bucket(minioStorageSupport.getBucket())
                                            .prefix(prefix)
                                            .continuationToken(continuationToken)
                                            .build());

            response.contents().stream()
                    .map(S3Object::key)
                    .filter(Objects::nonNull)
                    .forEach(keys::add);

            continuationToken = response.isTruncated() ? response.nextContinuationToken() : null;
        } while (continuationToken != null);

        return keys;
    }
}
