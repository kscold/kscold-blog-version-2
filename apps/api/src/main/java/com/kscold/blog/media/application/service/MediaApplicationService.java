package com.kscold.blog.media.application.service;

import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.media.application.port.in.MediaUseCase;
import com.kscold.blog.media.domain.model.Media;
import com.kscold.blog.media.domain.port.out.FileStoragePort;
import com.kscold.blog.media.domain.port.out.MediaRepository;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaApplicationService implements MediaUseCase {

    private final MediaRepository mediaRepository;
    private final FileStoragePort fileStoragePort;

    @Value("${file.max-size:10485760}")
    private long maxFileSize;

    private static final Map<String, String> ALLOWED_IMAGE_TYPES =
            Map.of(
                    "jpg", "image/jpeg",
                    "jpeg", "image/jpeg",
                    "png", "image/png",
                    "gif", "image/gif",
                    "webp", "image/webp");

    @Transactional
    public Media upload(MultipartFile file, String uploaderId, String uploaderName) {
        validateFile(file);

        String fileUrl = fileStoragePort.store(file);

        Media media =
                Media.builder()
                        .originalFilename(file.getOriginalFilename())
                        .savedFilename(extractFilename(fileUrl))
                        .filePath(fileUrl)
                        .fileUrl(fileUrl)
                        .contentType(file.getContentType())
                        .fileSize(file.getSize())
                        .uploader(
                                Media.UploaderInfo.builder()
                                        .id(uploaderId)
                                        .name(uploaderName)
                                        .build())
                        .build();

        log.info("File uploaded successfully: {}", fileUrl);

        return mediaRepository.save(media);
    }

    @Transactional
    public void delete(String fileUrl) {
        fileStoragePort.delete(fileUrl);

        mediaRepository.findByFileUrl(fileUrl).ifPresent(mediaRepository::delete);

        log.info("Media deleted successfully: {}", fileUrl);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "파일이 비어있습니다");
        }

        if (file.getSize() > maxFileSize) {
            throw new InvalidRequestException(
                    ErrorCode.INVALID_INPUT_VALUE,
                    String.format("파일 크기가 너무 큽니다 (최대 %dMB)", maxFileSize / 1024 / 1024));
        }

        String contentType = file.getContentType();
        String filename = file.getOriginalFilename();
        String extension = getFileExtension(filename).toLowerCase(Locale.ROOT);
        String expectedContentType = ALLOWED_IMAGE_TYPES.get(extension);
        if (expectedContentType == null || !expectedContentType.equals(contentType)) {
            throw new InvalidRequestException(ErrorCode.INVALID_INPUT_VALUE, "허용되지 않는 파일 형식입니다");
        }

        if (!hasExpectedFileSignature(file, expectedContentType)) {
            throw new InvalidRequestException(
                    ErrorCode.INVALID_INPUT_VALUE, "파일 내용이 이미지 형식과 일치하지 않습니다");
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    private String extractFilename(String fileUrl) {
        if (fileUrl == null || !fileUrl.contains("/")) {
            return fileUrl;
        }
        return fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
    }

    private boolean hasExpectedFileSignature(MultipartFile file, String contentType) {
        try (InputStream inputStream = file.getInputStream()) {
            byte[] header = inputStream.readNBytes(12);
            return switch (contentType) {
                case "image/jpeg" ->
                        startsWith(header, new byte[] {(byte) 0xff, (byte) 0xd8, (byte) 0xff});
                case "image/png" ->
                        startsWith(
                                header,
                                new byte[] {(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a});
                case "image/gif" ->
                        startsWith(header, "GIF87a".getBytes(StandardCharsets.US_ASCII))
                                || startsWith(header, "GIF89a".getBytes(StandardCharsets.US_ASCII));
                case "image/webp" ->
                        header.length >= 12
                                && startsWith(header, "RIFF".getBytes(StandardCharsets.US_ASCII))
                                && matchesAt(header, 8, "WEBP".getBytes(StandardCharsets.US_ASCII));
                default -> false;
            };
        } catch (IOException ignored) {
            return false;
        }
    }

    private boolean startsWith(byte[] value, byte[] prefix) {
        return matchesAt(value, 0, prefix);
    }

    private boolean matchesAt(byte[] value, int offset, byte[] expected) {
        if (value.length < offset + expected.length) {
            return false;
        }
        for (int index = 0; index < expected.length; index++) {
            if (value[offset + index] != expected[index]) {
                return false;
            }
        }
        return true;
    }
}
